import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from '@adminjs/themes'

AdminJS.registerAdapter(AdminJSMongoose);

export const admin = new AdminJS({
    resources: [
        {
            resource: Models.Customer,
            options: {
                listProperties: ['phone', 'role', 'isActivated'],
                filterProperties: ['phone', 'role'],
            }
        },
        {
            resource: Models.DeliveryPartner,
            options: {
                listProperties: ['email', 'role', 'isActivated'],
                filterProperties: ['email', 'role'],
            }
        },
        {
            resource: Models.Admin,
            options: {
                listProperties: ['email', 'role', 'isActivated'],
                filterProperties: ['email', 'role'],
            }
        },
        { resource: Models.Branch },
        { resource: Models.Category },
        { resource: Models.Product},
        { resource: Models.Order },
        { resource: Models.Counter },
    ],
    branding: {
        companyName: 'M&F Mart',
        withMadeWithLove: false,
        favicon: 'https://res.cloudinary.com/dn7yzyxae/image/upload/v1726779584/evgrghfnlfhqnue3xpxn.webp',
        logo: 'https://res.cloudinary.com/dn7yzyxae/image/upload/v1726779584/evgrghfnlfhqnue3xpxn.webp',
    },
    defaultTheme: dark.id,
    availableThemes: [ dark, light, noSidebar ],
    rootPath: '/admin'
});

export const buildAdminRouter = async (app) => {
    await AdminJSFastify.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookiePassword: COOKIE_PASSWORD,
            cookieName: 'adminjs',
            // cookieMaxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        },
        app,
        {
            store: sessionStore,
            saveUnintialized: true,
            secret: COOKIE_PASSWORD,
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            }
        }
    )
} 