const express = require('express');
const router = express.Router();

let registros = [];
let id = 1;

// READ
router.get('/', (req, res) => {
    res.json(registros);
});

// CREATE
router.post('/', (req, res) => {
    const nuevo = { id: id++, ...req.body };
    registros.push(nuevo);
    res.json(nuevo);
});

// UPDATE
router.put('/:id', (req, res) => {
    const index = registros.findIndex(r => r.id == req.params.id);
    if (index === -1) return res.sendStatus(404);

    registros[index] = { id: registros[index].id, ...req.body };
    res.json(registros[index]);
});

// DELETE
router.delete('/:id', (req, res) => {
    registros = registros.filter(r => r.id != req.params.id);
    res.json({ ok: true });
});

module.exports = router;
