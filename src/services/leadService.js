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
    // Preserva mxStatus do summary (LeadResponseSummary) se não houver dns aninhado
    mxStatus: lead.dns?.mxStatus ?? lead.mxStatus,
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
    // O campo no schema OpenAPI é "openSerpRawData" (dentro de DiscoveryData)
    openSerpRawData: lead.discovery?.openSerpRawData,
    // Alias para compatibilidade com a view (que usa "serperRawData")
    serperRawData: lead.discovery?.openSerpRawData,
  };
};

/**
 * GET /api/v1/leads — Lista todos os leads com status ACTIVE (paginado)
 *
 * @param {Object} options - Opções de paginação
 * @param {number} [options.page=0] - Número da página (0-based)
 * @param {number} [options.size=20] - Itens por página
 * @param {string} [options.sort='createdAt,desc'] - Campo de ordenação
 * @returns {Promise<{leads: Array, pagination: Object}>} Leads normalizados + metadados de paginação
 */
const getLeads = async ({ page = 0, size = 20, sort = 'createdAt,desc' } = {}) => {
  const response = await api.get('', {
    params: { page, size, sort }
  });
  const body = response.data;

  // A API retorna PagedLeadResponse com { content, page: { size, totalElements, totalPages, number } }
  const leads = extractLeadsFromBody(body);
  const pagination = body?.page ? {
    size: body.page.size,
    totalElements: body.page.totalElements,
    totalPages: body.page.totalPages,
    number: body.page.number,
  } : null;

  return {
    leads: leads.map(normalizeLead),
    pagination,
  };
};

/**
 * GET /api/v1/leads/{id} — Obtém um lead pelo ID
 */
const getLeadById = async (id) => {
  const response = await api.get(`/${id}`);
  return normalizeLead(response.data);
};

/**
 * GET /api/v1/leads/domain/{domain} — Lista leads por domínio (paginado)
 *
 * @param {string} domain - Domínio para filtrar
 * @param {Object} [options] - Opções de paginação
 * @param {number} [options.page=0] - Número da página (0-based)
 * @param {number} [options.size=20] - Itens por página
 * @param {string} [options.sort='createdAt,desc'] - Campo de ordenação
 * @returns {Promise<{leads: Array, pagination: Object|null}>}
 */
const getLeadsByDomain = async (domain, { page = 0, size = 20, sort = 'createdAt,desc' } = {}) => {
  const response = await api.get(`/domain/${encodeURIComponent(domain)}`, {
    params: { page, size, sort }
  });
  const body = response.data;

  // Pode retornar PagedLeadResponse ou array direto (204 se vazio)
  const leads = extractLeadsFromBody(body);
  const pagination = body?.page ? {
    size: body.page.size,
    totalElements: body.page.totalElements,
    totalPages: body.page.totalPages,
    number: body.page.number,
  } : null;

  return {
    leads: leads.map(normalizeLead),
    pagination,
  };
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
