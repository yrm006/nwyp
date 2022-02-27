import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const PORT = 2022;
const DBO = new DB("nwyp.db");



const router = new Router();{
    router.get('/reg-photo/:id-:filename', async function(ctx){
        await send(ctx, `${ctx.params.id}-${ctx.params.filename}`, {
            root: './reg-photo',
        });
    });

    router.get('/req-photo/:id-:filename', async function(ctx){
        await send(ctx, `${ctx.params.id}-${ctx.params.filename}`, {
            root: './req-photo',
        });
    });

    router.post("/register", async function(ctx){
        const body = await ctx.request.body();
        const form = await body.value.read({ maxFileSize: 104_857_600});
                                                                                console.log(form);

        let id;
        let reason;

        DBO.query("BEGIN");
        try{
            DBO.query("INSERT INTO TRegistered (sTitle,sWhere,sContact) VALUES (?,?,?)", 
                [form.fields.title, form.fields.where, form.fields.contact]);

            const rid = DBO.lastInsertRowId;

            const file = form.files[0];
            Deno.renameSync(file.filename, `./reg-photo/${rid}-${file.originalName}`);
            DBO.query("UPDATE TRegistered set sPhoto=? where id=?", [file.originalName, rid]);

            DBO.query("COMMIT");
            id = rid;
                                                                                console.log("a goods was accepted. ", id);
        }catch(e){
                                                                                console.log(e);
            reason = "check your some inputs.";
            DBO.query("ROLLBACK");
        }

        if(id){
            ctx.response.redirect(`registered.html?id=${id}`);
        }else{
            ctx.response.body = { message: "NG", reason: reason };
        }
    });

    router.post("/request", async function(ctx){
        const body = await ctx.request.body();
        const form = await body.value.read({ maxFileSize: 104_857_600});
                                                                                console.log(form);

        let id;
        let reason;

        DBO.query("BEGIN");
        try{
            DBO.query("INSERT INTO TRequested (sTitle,sWhere,sContact) VALUES (?,?,?)", 
                [form.fields.title, form.fields.where, form.fields.contact]);

            const rid = DBO.lastInsertRowId;

            const file = form.files[0];
            Deno.renameSync(file.filename, `./req-photo/${rid}-${file.originalName}`);
            DBO.query("UPDATE TRequested set sPhoto=? where id=?", [file.originalName, rid]);

            DBO.query("COMMIT");
            id = rid;
                                                                                console.log("a request was accepted. ", id);
        }catch(e){
                                                                                console.log(e);
            reason = "check your some inputs.";
            DBO.query("ROLLBACK");
        }

        if(id){
            ctx.response.redirect(`requested.html?id=${id}`);
        }else{
            ctx.response.body = { message: "NG", reason: reason };
        }
    });

    router.get("/registered", async function(ctx, next){
        const q = ctx.request.url.searchParams.get("q");
        const id = ctx.request.url.searchParams.get("id");

        if(q){
            const r = DBO.queryEntries("SELECT * FROM TRegistered where sTitle like ?", [`%${q}%`]);
            ctx.response.body = r;
        }else
        if(id){
            const r = DBO.queryEntries("SELECT * FROM TRegistered where id=?", [id]);
            ctx.response.body = r;
        }else
        {
            ctx.response.body = [];
        }
    });

    router.get("/requested", async function(ctx, next){
        const q = ctx.request.url.searchParams.get("q");
        const id = ctx.request.url.searchParams.get("id");

        if(q){
            const r = DBO.queryEntries("SELECT * FROM TRequested where sTitle like ?", [`%${q}%`]);
            ctx.response.body = r;
        }else
        if(id){
            const r = DBO.queryEntries("SELECT * FROM TRequested where id=?", [id]);
            ctx.response.body = r;
        }else
        {
            ctx.response.body = [];
        }
    });
}



const app = new Application();{
    app.use(router.routes());
    app.use(async function(ctx){
        if(ctx.request.method === "GET"){
            try{
                await send(ctx, ctx.request.url.pathname, {
                    root: `${Deno.cwd()}/www`,
                    index: "index.html",
                });
            }catch(e){}
        }
    });

                                                                                console.log('running on port ', PORT);
    await app.listen({ port: PORT });
}


