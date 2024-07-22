const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post('/create/:base', async (req, res) => {
  try {
    const basedatos = req.params.base;
    const data = req.body;
    console.log(data)
    const docRef = await db.collection(basedatos).add(data);
    res.status(200).send(`Document created with ID: ${docRef.id}`);
  } catch (error) {
    res.status(500).send(`Error creating document: ${error.message}`);
  }
});

// Endpoint para actualizar un documento en una colección (PUT)
app.put('/update/:base/:id', async (req, res) => {
  try {
    const basedatos = req.params.base
    const documentId = req.params.id;
    const data = req.body;
    await db.collection(basedatos).doc(documentId).set(data, { merge: true });
    res.status(200).send(`Document with ID: ${documentId} updated`);
  } catch (error) {
    res.status(500).send(`Error updating document: ${error.message}`);
  }
});

// Endpoint para eliminar un documento en una colección (DELETE)
app.delete('/delete/:base/:id', async (req, res) => {
  try {
    const basedatos = req.params.base;
    const documentId = req.params.id;
    await db.collection(basedatos).doc(documentId).delete();
    res.status(200).send(`Document with ID: ${documentId} deleted`);
  } catch (error) {
    res.status(500).send(`Error deleting document: ${error.message}`);
  }
});

app.get('/getAll/:base', async (req, res) => {
  try {
    const basedatos = req.params.base
    const snapshot = await db.collection(basedatos).get();
    if (snapshot.empty) {
      res.status(404).send('No documents found');
      return;
    }

    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).send(`Error retrieving documents: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
