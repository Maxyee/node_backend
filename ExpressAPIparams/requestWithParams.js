app.get('/p/:sortBy/:field', function(req, res) {
    res.send("sortBy is set to " + req.params.sortBy);
    res.send("field is set to " + req.params.field);
});


// if we want to get a query parameter ?sortBy=aes&field=hostname
app.get('/p', function(req, res) {
    res.send("sortBy is set to " + req.query.sortBy)
    res.send("field is set to " + req.query.field)
})