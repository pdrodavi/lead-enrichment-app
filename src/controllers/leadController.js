const {
  getLeads,
  getLeadById,
  getLeadsByDomain,
  enrichLead,
  deleteLead,
  updateLead
} = require('../services/leadService');

exports.getIndex = async (req, res) => {
  let leads = [];
  let pagination = null;
  try {
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 20;
    const sort = req.query.sort || 'createdAt,desc';
    const result = await getLeads({ page, size, sort });
    leads = result.leads;
    pagination = result.pagination;
  } catch (err) {
    console.error('Erro ao buscar leads da API:', err.message);
  }
  res.render('pages/index', { leads, pagination, lead: null, error: null });
};

exports.postEnrich = async (req, res) => {
  try {
    const { email, dominio, nome } = req.body;
    await enrichLead(email, dominio, nome);
    res.redirect('/');
  } catch (err) {
    let leads = [];
    let pagination = null;
    try {
      const result = await getLeads();
      leads = result.leads;
      pagination = result.pagination;
    } catch (_) { /* ignore */ }
    res.render('pages/index', { leads, pagination, lead: null, error: 'Erro ao enriquecer lead: ' + err.message });
  }
};

/**
 * GET /api/v1/leads/{id} — Obtém detalhes de um lead via API
 */
exports.getLead = async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    res.json({ success: true, lead });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /domain/{domain} — Busca leads por domínio via API (paginado)
 */
exports.getByDomain = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 20;
    const sort = req.query.sort || 'createdAt,desc';
    const result = await getLeadsByDomain(req.params.domain, { page, size, sort });
    res.json({ success: true, leads: result.leads, pagination: result.pagination });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ success: false, error: 'Nenhum lead encontrado para este domínio' });
    }
    if (err.response && err.response.status === 204) {
      return res.json({ success: true, leads: [], pagination: null });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteEnrich = async (req, res) => {
  try {
    const data = await deleteLead(req.params.id);
    res.json({ success: true, message: data.message || data.msg || 'Lead excluído com sucesso.' });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado', id: req.params.id });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.putUpdate = async (req, res) => {
  try {
    const { email, dominio, nome } = req.body;
    const lead = await updateLead(req.params.id, { email, domain: dominio, name: nome });
    res.json({ success: true, lead });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
