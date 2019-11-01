# Simple POS

The Simple POS application built using the following stack of technologies
1. Ionic 3 Framework (Angular 2+ TypeScript)
2. CouchDB (IndexDB based Document format data storage mechanism or offline-first applications)
3. PouchDB (Micro ORM built on top of PouchDB to support two-way data synchronization accross devices to support offline-first apps)
4. Ionic Cordova Plugins (Official and Community)
5. Electron (for porting the app for deskptop environment)

Simple POS is a tablet based application that can be built into Android, iOS and desktop apps.
The deployment was pipelined using Ionic Deploy (And Ionic In-House Deployment System).
There are no backend APIs used, therefore no backend server is maintained to store data. Instead CouchDB does all that, by following the Replication Protocol, it directly talks with application and synchronizes all data to deliver offline experience.
CouchDB is a document based data storage, which basically stores every piece of data in a flat document in the browsers IndexDB storage mechanism.
