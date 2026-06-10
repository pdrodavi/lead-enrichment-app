const axios = require('axios');

const api = axios.create({
  baseURL: process.env.LEAD_ENRICHMENT_API_URL,
  headers: {
    'X-API-KEY': process.env.LEAD_ENRICHMENT_API_KEY
  }
});



// Armazenamento local de leads enriquecidos (em memória)
const leadsStore = [];

const getLeads = async () => {
  const response = await api.get('');
  const body = response.data;
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.leads)) return body.leads;
  return body;
};

const getLocalLeads = () => {
  return [...leadsStore];
};

const enrichLead = async (email, dominio, nome) => {
  const response = await api.post('/enrich', { email, domain: dominio, name: nome });
  const lead = response.data;
  leadsStore.unshift(lead);
  return lead;
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
