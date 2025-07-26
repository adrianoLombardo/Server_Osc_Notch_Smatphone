# Notch OSC QR Server

Server Node.js che riceve brevi "pensieri" via HTTP e li inoltra a Notch tramite OSC. Include filtri anti-volgarità e gestione di slot in round-robin.

## Installazione

```bash
npm install
```

## Avvio

Per avviare con riavvio automatico in caso di crash:

```bash
npm run run
```

Oppure avviare direttamente:

```bash
npm start
```

Le porte e l'host di destinazione possono essere configurati nel file `config.env`.
