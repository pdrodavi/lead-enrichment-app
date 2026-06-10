const { getLeads, getLocalLeads, enrichLead, deleteLead, updateLead } = require('../services/leadService');

exports.getIndex = async (req, res) => {
  let leads = [];
  try {
    leads = await getLeads();
  } catch (err) {
    leads = getLocalLeads();
  }
  res.render('pages/index', { leads, lead: null, error: null });
};

exports.postEnrich = async (req, res) => {
  try {
    const { email, dominio, nome } = req.body;
    await enrichLead(email, dominio, nome);
    res.redirect('/');
  } catch (err) {
    let leads = [];
    try {
      leads = await getLeads();
    } catch (_) {
      leads = getLocalLeads();
    }
    res.render('pages/index', { leads, lead: null, error: 'Erro ao enriquecer lead: ' + err.message });
  }
};

exports.deleteEnrich = async (req, res) => {
  try {
    const data = await deleteLead(req.params.id);
    res.json({ success: true, message: data.message || data.msg || 'Lead excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.putUpdate = async (req, res) => {
  try {
    const { email, dominio, nome } = req.body;
    const lead = await updateLead(req.params.id, { email, domain: dominio, name: nome });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
