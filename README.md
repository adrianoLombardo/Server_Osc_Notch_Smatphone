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

Per un'interfaccia in stile **cmd** che consente di avviare o fermare il server e modificare IP/porta di Notch:

```bash
npm run cli
```

Segui i semplici menu testuali per inserire i parametri e avviare il server.

Per una piccola interfaccia a finestre (**TUI**) con pulsanti Start/Stop e un riquadro dei log:

```bash
npm run tui
```

Premi `q` o `Ctrl+C` per uscire.
