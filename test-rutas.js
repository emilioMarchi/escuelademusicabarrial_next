/**
 * Script para verificar que las rutas del sitio respondan correctamente
 * Uso: node test-rutas.js
 */

const URL_BASE = 'https://www.escuelademusicabarrial.ar';

// Rutas a testear (del sitemap)
const RUTAS = [
  '/',
  '/clases',
  '/novedades',
  '/galeria',
  '/como-ayudar',
  '/contacto',
  '/login',
  // Rutas dinámicas - descomentá las que existan en tu DB:
  // '/clases/guitarra',
  // '/clases/piano',
  // '/novedades/tu-noticia',
];

async function testRuta(ruta) {
  const url = `${URL_BASE}${ruta}`;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow'
    });
    
    const status = response.status;
    const ok = status >= 200 && status < 400;
    
    return {
      ruta,
      status,
      ok,
      mensaje: ok ? '✅ OK' : `❌ Error ${status}`
    };
  } catch (error) {
    return {
      ruta,
      status: 'ERROR',
      ok: false,
      mensaje: `❌ Error de conexión: ${error.message}`
    };
  }
}

async function main() {
  console.log(`🧪 Testeando rutas en: ${URL_BASE}\n`);
  
  const resultados = await Promise.all(RUTAS.map(testRuta));
  
  // Mostrar resultados
  resultados.forEach(r => {
    console.log(`${r.mensaje} ${r.ruta}`);
  });
  
  // Resumen
  const okCount = resultados.filter(r => r.ok).length;
  const total = resultados.length;
  
  console.log(`\n📊 Resultado: ${okCount}/${total} rutas OK`);
  
  // Exit code
  if (okCount < total) {
    console.log('\n⚠️  Hay rutas con problemas');
    process.exit(1);
  } else {
    console.log('\n✨ Todas las rutas funcionan correctamente');
    process.exit(0);
  }
}

main();
