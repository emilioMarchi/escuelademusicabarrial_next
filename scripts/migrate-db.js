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

async function migrateTeachersFromSettings() {
  console.log('--- Migrando nombres de docentes desde "settings/teachers" a la colección "docentes" ---');
  
  const settingsRef = db.collection('settings').doc('teachers');
  const settingsDoc = await settingsRef.get();

  if (!settingsDoc.exists) {
    console.log('No se encontró el documento "settings/teachers".');
    return;
  }

  const namesArray = settingsDoc.data().list || [];
  if (namesArray.length === 0) {
    console.log('La lista de nombres en "settings/teachers" está vacía.');
    return;
  }

  // Obtener docentes existentes para evitar duplicados
  const teachersRef = db.collection('docentes');
  const teachersSnapshot = await teachersRef.get();
  const existingNames = new Set(teachersSnapshot.docs.map(doc => (doc.data().name || "").toLowerCase().trim()));

  const batch = db.batch();
  let migratedCount = 0;
  let skippedCount = 0;

  for (const name of namesArray) {
    const normalizedName = (name || "").toLowerCase().trim();
    if (!normalizedName) continue;

    if (existingNames.has(normalizedName)) {
      console.log(`- Docente "${name}": Ya existe en la colección, saltando.`);
      skippedCount++;
      continue;
    }

    const newDocRef = teachersRef.doc();
    batch.set(newDocRef, {
      name: name,
      instruments: [],
      experience: "",
      email: "",
      phone: "",
      is_active: true,
      category: "docentes",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_updated: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`- Docente "${name}": Agregado a la migración.`);
    migratedCount++;
    existingNames.add(normalizedName);
  }

  if (migratedCount > 0) {
    await batch.commit();
    console.log(`--- Migración completada: ${migratedCount} docentes creados. ${skippedCount} ya existían. ---`);
  } else {
    console.log('--- No se encontraron docentes nuevos para migrar. ---');
  }
}

async function run() {
  try {
    await cleanClassTeachers();
    await migrateTeachersFromSettings();
  } catch (e) {
    console.error(e);
  }
}

run();
