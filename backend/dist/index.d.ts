import 'reflect-metadata';
import express from 'express';
declare class App {
    private app;
    private port;
    private databaseService;
    private logger;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
    stop(): Promise<void>;
    getApp(): express.Application;
}
declare const app: App;
export default app;
//# sourceMappingURL=index.d.ts.map