Bun.serve({
    fetch(req: Request) {
        const url = new URL(req.url);

        switch (url.pathname) {
            case "/":
                return new Response("Hello World!");
            case "/json":
                return new Response(JSON.stringify({ hello: "world" }), {
                    headers: { "content-type": "application/json" }
                });
            default:
                return new Response(`Sorry, I didn't find ${url.pathname}`, { status: 404 });
        }
    },
    port: 8080
});