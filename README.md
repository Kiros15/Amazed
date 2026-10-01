# AMAZED V0.2

Juego de equilibrio para navegador, sin dependencias de producción ni compilación. Vercel sirve `index.html` desde la raíz.

Diez niveles progresivos, metas accesibles, agujeros, obstáculos móviles, hielo, arena, checkpoints y puntuación de 1–3 estrellas. Completar cada nivel desbloquea el siguiente; las mejores estrellas se guardan en el navegador.

## Controles

- iPhone: abrir por HTTPS en Safari, pulsar **Activar giroscopio** y aceptar el permiso. El primer evento calibra la posición inicial. **Calibrar** cambia el centro.
- Alternativa: botones táctiles (admiten diagonales) o flechas del teclado.
- Al perder el foco o cambiar la orientación se pausa la partida.

## Validación

`node tests/engine.test.cjs` comprueba rutas completas en los diez niveles usando la física real, evitando incluso todo el recorrido de los obstáculos móviles; también verifica checkpoints y estrellas.

`node tests/browser.test.cjs` requiere Playwright y Chromium. Se pueden indicar `PLAYWRIGHT_PATH` (módulo) y `CHROME_PATH` (ejecutable). Prueba controles, sensor simulado, pausa, victoria, desbloqueos, persistencia y tamaño móvil; captura errores JavaScript.

El sensor simulado no sustituye una prueba física en iPhone. Los tiempos objetivo son iniciales y pueden afinarse con pruebas humanas.
