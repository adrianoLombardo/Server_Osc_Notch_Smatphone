import tkinter as tk
from tkinter import scrolledtext
from PIL import Image, ImageTk
import subprocess
import threading
import os
import sys

# Percorsi
BASEDIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASEDIR, "config.env")
START_SCRIPT = os.path.join(BASEDIR, "start.cjs")
ICON_PATH = os.path.join(BASEDIR, "holyclub_logo.ico")
LOGO_IMAGE_PATH = os.path.join(BASEDIR, "public", "img", "logo.JPG")

server_process = None

def load_env():
    config = {
        "NOTCH_HOST": "127.0.0.1",
        "NOTCH_PORT": "9000"
    }
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split("=", 1)
                    config[k.strip()] = v.strip()
    return config

def save_env(config):
    with open(CONFIG_PATH, "w") as f:
        for k, v in config.items():
            f.write(f"{k}={v}\n")

def start_server():
    global server_process
    if server_process is not None:
        log("⚠️ Server già in esecuzione.")
        return
    host = ip_entry.get()
    port = port_entry.get()
    env = os.environ.copy()
    env["NOTCH_HOST"] = host
    env["NOTCH_PORT"] = port
    save_env({"NOTCH_HOST": host, "NOTCH_PORT": port})
    try:
        server_process = subprocess.Popen(
            [sys.executable, START_SCRIPT],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=BASEDIR,
            text=True,
            env=env
        )
        log("✅ Server avviato...")
        start_button.config(state=tk.DISABLED)
        stop_button.config(state=tk.NORMAL)
        ip_entry.config(state=tk.DISABLED)
        port_entry.config(state=tk.DISABLED)
        threading.Thread(target=read_output, daemon=True).start()
    except Exception as e:
        log(f"❌ Errore avviando il server: {e}")

def stop_server():
    global server_process
    if server_process:
        server_process.terminate()
        server_process = None
        log("🛑 Server fermato.")
        start_button.config(state=tk.NORMAL)
        stop_button.config(state=tk.DISABLED)
        ip_entry.config(state=tk.NORMAL)
        port_entry.config(state=tk.NORMAL)

def read_output():
    for line in server_process.stdout:
        log(line)

def log(msg):
    log_box.insert(tk.END, msg + "\n")
    log_box.see(tk.END)

# GUI
root = tk.Tk()
root.title("Sailing Through Memories - OSC Server")
root.geometry("880x560")
root.configure(bg="black")
root.resizable(False, False)

# Icona finestra
if os.path.exists(ICON_PATH):
    try:
        root.iconbitmap(ICON_PATH)
    except Exception as e:
        print("Errore caricamento icona:", e)

# Top frame: logo a sinistra, input e bottoni a destra
top_frame = tk.Frame(root, bg="black")
top_frame.pack(pady=5, padx=10, fill="x")

# Logo ridimensionato (circa 4x4 cm = ~150x150 px)
try:
    logo_img = Image.open(LOGO_IMAGE_PATH).resize((150, 150))
    logo_tk = ImageTk.PhotoImage(logo_img)
    logo_label = tk.Label(top_frame, image=logo_tk, bg="black")
    logo_label.pack(side=tk.LEFT, padx=10)
except Exception as e:
    print("Errore caricamento logo:", e)
    logo_label = tk.Label(top_frame, text="LOGO", fg="white", bg="black")
    logo_label.pack(side=tk.LEFT, padx=10)

# Frame dei controlli
ctrl_frame = tk.Frame(top_frame, bg="black")
ctrl_frame.pack(side=tk.LEFT, padx=30, pady=30)

label_style = {"bg": "black", "fg": "white", "font": ("Courier New", 10)}
entry_style = {"bg": "black", "fg": "white", "insertbackground": "white"}

tk.Label(ctrl_frame, text="Notch IP:", **label_style).grid(row=0, column=0, sticky="e", padx=5, pady=5)
ip_entry = tk.Entry(ctrl_frame, width=18, **entry_style)
ip_entry.grid(row=0, column=1, padx=5)

tk.Label(ctrl_frame, text="OSC Port:", **label_style).grid(row=1, column=0, sticky="e", padx=5, pady=5)
port_entry = tk.Entry(ctrl_frame, width=10, **entry_style)
port_entry.grid(row=1, column=1, padx=5)

start_button = tk.Button(ctrl_frame, text="Start Server", width=15, bg="#005500", fg="white", command=start_server)
start_button.grid(row=2, column=0, padx=5, pady=10)

stop_button = tk.Button(ctrl_frame, text="Stop", width=10, bg="#550000", fg="white", state=tk.DISABLED, command=stop_server)
stop_button.grid(row=2, column=1, padx=5, pady=10)

# Log box
log_box = scrolledtext.ScrolledText(
    root, wrap=tk.WORD, height=25,
    font=("Courier New", 10),
    bg="black", fg="white", insertbackground="white"
)
log_box.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

# Config iniziale
env_config = load_env()
ip_entry.insert(0, env_config.get("NOTCH_HOST", "127.0.0.1"))
port_entry.insert(0, env_config.get("NOTCH_PORT", "9000"))

# Chiusura
def on_close():
    stop_server()
    root.destroy()

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()
