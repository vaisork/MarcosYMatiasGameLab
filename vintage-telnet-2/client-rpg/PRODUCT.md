# Vaisgard RPG

<!-- impeccable:product-schema 1 -->

## Platform

web

## Scope

Este registro describe exclusivamente `vintage-telnet-2/client-rpg`, no los otros juegos del repositorio.

## Users

Javier y los jugadores de Vaisgard exploran el mismo mundo persistente desde móvil y escritorio.

## Product Purpose

Un RPG visual jugable con entrada, personaje, exploración, interacciones y combate conectado a la partida existente de Vintage Telnet 2. El usuario solicita una mejora visual integral y autoriza trabajo persistente con AGY hasta entregar.

## Capabilities and Constraints

Servidor Python y SQLite únicos; cliente Canvas2D sin dependencias externas. Mismo usuario, personaje y progreso. Acciones de juego sólo desde snapshot.actions o texto, combate por rondas del servidor (~4s). No cambiar motor, canon, fórmulas ni balance. Cada juego tiene entrada independiente; no ofrecer cambio de modo. Preservar login, registro, aprobación, selección y creación de personajes, movimiento, submenús, batalla y recuperación de red.

## Brand Commitments

Nombre Vaisgard RPG. Referencias conceptuales proporcionadas por Javier el17oct2026: inicio ilustrado de fantasía luminosa, exploración a pantalla completa con interfaz azul/oro y batalla de composición monumental. Establecen el acabado y la experiencia; cifras, criaturas, monedas, indicadores y acciones deben proceder de la partida real. El usuario acepta que lograrlo tome días y ha autorizado empezar.

## Evidence on Hand

Tres referencias JPEG adjuntas, contrato docs/VAISGARD_RPG.md y arte original del piloto Edran. Base79dfbdc de PR742 en borrador:314 tests OK(1skip), CI verde y recorridos reales verificados conAGY. Se conservan tres pilotos originales y seis salas de Campos01 aún no integradas.

## Product Principles

- El juego y el mundo ocupan el primer plano.
- Interfaz legible y utilizable con tacto y teclado.
- El arte respeta la identidad y los datos reales del mundo.
- Las pruebas y el servidor gobiernan la entrega.

## Delivery

PR revisable y QA móvil/escritorio. Merge y despliegue requieren aprobación por iteración según relevo.
