#!/usr/bin/env python3

import http.server
from aiohttp import web
#import aiohttp
import ssl
import os
import sys
import subprocess

ROOT_DIR = os.path.abspath(".")
CERT_PATH = "./certificate.crt"
KEY_PATH = "./private.key"

#openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048
# openssl req -new -key private.key -out csr.csr
# openssl x509 -req -days 365 -in csr.csr -signkey private.key -out certificate.crt
if "-renew" in sys.argv:
    print(end="Do Total-Renew? [y/N] ")
    ent = input().lower()
    if(ent in "?"):
        cmd = f"openssl req -x509 -newkey rsa:4096 -keyout {KEY_PATH} -out {CERT_PATH} -sha256 -days 365"
        subprocess.run(cmd.split(" "),stdin=sys.stdin,stdout=sys.stdout)
        sys.exit(0)
    if ent in 'yj':
        cmd = f"openssl genpkey -algorithm RSA -out {KEY_PATH} -pkeyopt rsa_keygen_bits:4096"
        subprocess.run(cmd.split(" "),stdin=sys.stdin,stdout=sys.stdout)
    cmd = f"openssl req -new -key {KEY_PATH} -out csr.csr"
    subprocess.run(cmd.split(" "),stdin=sys.stdin,stdout=sys.stdout)
    cmd = f"openssl x509 -req -days 365 -in csr.csr -signkey {KEY_PATH} -out {CERT_PATH}"
    subprocess.run(cmd.split(" "),stdin=sys.stdin,stdout=sys.stdout)
    sys.exit(0)
print("-renew")


def get_ssl_context(certfile, keyfile):
    #context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile, keyfile)
    #context.set_ciphers("@SECLEVEL=1:ALL")
    return context


#class MyHandler(http.server.SimpleHTTPRequestHandler):
#    def do_POST(self):
#        content_length = int(self.headers["Content-Length"])
#        post_data = self.rfile.read(content_length)
#        print(post_data.decode("utf-8"))
async def file_handler(request: web.Request) -> web.StreamResponse:
    rel_path = request.match_info["path"]
    fs_path = os.path.abspath(os.path.join(ROOT_DIR, rel_path))
    if not fs_path.startswith(ROOT_DIR + os.sep) and fs_path != ROOT_DIR:
        raise web.HTTPForbidden(text="Forbidden")
    if not os.path.exists(fs_path) or not os.path.isfile(fs_path):
        raise web.HTTPNotFound(text="Not found")
    return web.FileResponse(fs_path)
async def file_handler_index(request: web.Request) -> web.StreamResponse:
    fs_path = os.path.abspath(os.path.join(ROOT_DIR, "index.html"))
    if not fs_path.startswith(ROOT_DIR + os.sep) and fs_path != ROOT_DIR:
        raise web.HTTPForbidden(text="Forbidden")
    if not os.path.exists(fs_path) or not os.path.isfile(fs_path):
        raise web.HTTPNotFound(text="Not found")
    return web.FileResponse(fs_path)


server_address = ("0.0.0.0", 8080)
#httpd = http.server.HTTPServer(server_address, MyHandler)
#httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
#context = get_ssl_context("certificate.crt", "private.key")
#httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
#httpd.serve_forever()


app = web.Application()
app.router.add_get("/", file_handler_index)
app.router.add_get("/{path:.*}", file_handler)

if __name__ == "__main__":
    ssl_ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_ctx.load_cert_chain(certfile=CERT_PATH, keyfile=KEY_PATH)
    web.run_app(app, host="0.0.0.0", port=8080, ssl_context=ssl_ctx)
