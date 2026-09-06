const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.DB_PATH || 'niangaly.db');

db.exec(`CREATE TABLE IF NOT EXISTS applications (
 id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 name TEXT NOT NULL, phone TEXT NOT NULL, city TEXT NOT NULL, vehicle_type TEXT NOT NULL,
 brand_model TEXT NOT NULL, year TEXT NOT NULL, registration TEXT NOT NULL, capacity TEXT,
 service TEXT, availability TEXT, status TEXT DEFAULT 'Nouvelle'
)`);

db.exec(`CREATE TABLE IF NOT EXISTS messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 name TEXT NOT NULL, phone TEXT NOT NULL, message TEXT NOT NULL
)`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/applications', (req,res)=>{
  const fields = ['name','phone','city','vehicle_type','brand_model','year','registration'];
  if(fields.some(k => !String(req.body[k] || '').trim())) return res.status(400).json({ok:false,error:'Veuillez remplir tous les champs obligatoires.'});
  const stmt = db.prepare(`INSERT INTO applications (name,phone,city,vehicle_type,brand_model,year,registration,capacity,service,availability) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  stmt.run(req.body.name,req.body.phone,req.body.city,req.body.vehicle_type,req.body.brand_model,req.body.year,req.body.registration,req.body.capacity||'',req.body.service||'',req.body.availability||'');
  res.json({ok:true,message:'Votre candidature a bien été envoyée.'});
});

app.post('/api/messages',(req,res)=>{
  if(!req.body.name || !req.body.phone || !req.body.message) return res.status(400).json({ok:false});
  db.prepare('INSERT INTO messages (name,phone,message) VALUES (?,?,?)').run(req.body.name,req.body.phone,req.body.message);
  res.json({ok:true});
});

app.get('/api/admin/applications',(req,res)=> res.json(db.prepare('SELECT * FROM applications ORDER BY id DESC').all()));
app.get('/api/admin/messages',(req,res)=> res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC').all()));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`NIANGALY SERVICE COMMERCIALE sur le port ${PORT}`));
