const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};

envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const projectId = env.FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKey = env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function cleanClassTeachers() {
  console.log('--- Eliminando atributos de docentes en la colección "clases" ---');
  
  const classesRef = db.collection('clases');
  const snapshot = await classesRef.get();

  if (snapshot.empty) {
    console.log('No se encontraron clases.');
    return;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    // Usamos FieldValue.delete() para asegurar que el atributo desaparezca del documento
    batch.update(doc.ref, {
      teacher_name: admin.firestore.FieldValue.delete(),
      teachers: admin.firestore.FieldValue.delete()
    });
    console.log(`- Clase "${doc.data().name}": Marcada para eliminar campos de docentes.`);
    count++;
  });

  await batch.commit();
  console.log(`--- Limpieza completada: ${count} documentos actualizados en Firebase ---`);
}

cleanClassTeachers().catch(console.error);
