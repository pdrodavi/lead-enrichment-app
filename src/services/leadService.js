const axios = require('axios');

const api = axios.create({
  baseURL: process.env.LEAD_ENRICHMENT_API_URL,
  headers: {
    'X-API-KEY': process.env.LEAD_ENRICHMENT_API_KEY
  }
});

/**
 * Extrai um array de leads de diferentes formatos de resposta da API.
 * @param {*} body - Corpo da resposta da API
 * @returns {Array} Array de leads
 */
const extractLeadsFromBody = (body) => {
  if (Array.isArray(body)) return body;
  if (!body) return [];
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.leads)) return body.leads;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(body.results)) return body.results;
  if (Array.isArray(body.content)) return body.content;
  if (body._embedded && Array.isArray(body._embedded.leads)) return body._embedded.leads;
  return [];
};

/**
 * Normaliza um lead da estrutura aninhada da API (dns, discovery, rdap)
 * para manter compatibilidade com a view (campos "flat" para a tabela).
 * @param {Object} lead
 * @returns {Object}
 */
const normalizeLead = (lead) => {
  if (!lead) return lead;
  return {
    ...lead,
    // Flatten DNS para compatibilidade com a tabela
    mxStatus: lead.dns?.mxStatus,
    // Flatten Discovery para compatibilidade com a tabela
    technologies: lead.discovery?.technologies,
    socialLinks: lead.discovery?.socialLinks,
    socialProfileSummaries: lead.discovery?.socialProfileSummaries,
    exposedEmails: lead.discovery?.exposedEmails,
    nameMentions: lead.discovery?.nameMentions,
    nameMentionUrls: lead.discovery?.nameMentionUrls,
    dorkFindings: lead.discovery?.dorkFindings,
    foundDocuments: lead.discovery?.foundDocuments,
    discoveredUrls: lead.discovery?.discoveredUrls,
    openSerpRawData: lead.discovery?.openSerpRawData,
  };
};

/**
 * GET /api/v1/leads — Lista todos os leads com status ACTIVE
 */
const getLeads = async () => {
  const response = await api.get('');
  const leads = extractLeadsFromBody(response.data);
  return leads.map(normalizeLead);
};

/**
 * GET /api/v1/leads/{id} — Obtém um lead pelo ID
 */
const getLeadById = async (id) => {
  const response = await api.get(`/${id}`);
  return normalizeLead(response.data);
};

/**
 * GET /api/v1/leads/domain/{domain} — Lista leads por domínio
 */
const getLeadsByDomain = async (domain) => {
  const response = await api.get(`/domain/${encodeURIComponent(domain)}`);
  const leads = extractLeadsFromBody(response.data);
  return leads.map(normalizeLead);
};

/**
 * POST /api/v1/leads/enrich — Enriquece um lead com dados públicos
 *
 * A API retorna um array de leads do mesmo domínio.
 * Extraímos o primeiro lead enriquecido como principal.
 */
const enrichLead = async (email, dominio, nome) => {
  const response = await api.post('/enrich', { email, domain: dominio, name: nome });
  const body = response.data;

  // A API retorna um array (conforme OpenAPI spec):
  // type: array, items: LeadResponse
  const leads = extractLeadsFromBody(body);

  if (Array.isArray(leads) && leads.length > 0) {
    // Retorna o primeiro lead da lista como o recém-enriquecido
    return normalizeLead(leads[0]);
  }

  // Fallback: tenta tratar como objeto único
  return normalizeLead(body);
};

/**
 * PUT /api/v1/leads/{id} — Atualiza um lead e reenriquece
 */
const updateLead = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return normalizeLead(response.data);
};

/**
 * DELETE /api/v1/leads/{id} — Exclui um lead permanentemente (hard delete)
 */
const deleteLead = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

module.exports = { getLeads, getLeadById, getLeadsByDomain, enrichLead, deleteLead, updateLead };
