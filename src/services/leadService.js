const axios = require('axios');

const api = axios.create({
  baseURL: process.env.LEAD_ENRICHMENT_API_URL,
  headers: {
    'X-API-KEY': process.env.LEAD_ENRICHMENT_API_KEY
  }
});

// Armazenamento local de leads enriquecidos (em memória)
const leadsStore = [];

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

const getLeads = async () => {
  const response = await api.get('');
  return extractLeadsFromBody(response.data);
};

const getLocalLeads = () => {
  return [...leadsStore];
};

const enrichLead = async (email, dominio, nome) => {
  const response = await api.post('/enrich', { email, domain: dominio, name: nome });
  const lead = response.data;
  // Se a resposta vier encapsulada em data, extrai o lead
  const enrichedLead = (lead && lead.data && typeof lead.data === 'object' && !Array.isArray(lead.data))
    ? lead.data
    : lead;
  leadsStore.unshift(enrichedLead);
  return enrichedLead;
};

const deleteLead = async (id) => {
  const response = await api.delete('/' + id);
  return response.data;
};

const updateLead = async (id, data) => {
  const response = await api.put('/' + id, data);
  return response.data;
};

module.exports = { getLeads, getLocalLeads, enrichLead, deleteLead, updateLead };
