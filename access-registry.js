"use strict";
// Submenu harus diregistrasi dari modul sumber. Tidak menebak aturan izin asli.
// Untuk menu utama yang belum punya policy, permission custom tetap terkunci.
window.HEXA_ACCESS_ACTIONS = ['view','add','edit','delete','approve','export','manage'];
window.HEXA_ACCESS_CHILDREN = window.HEXA_ACCESS_CHILDREN || [
 {id:'daily-maintenance/start-inspection',parent:'daily-maintenance',name:'Start Inspection'},
 {id:'daily-maintenance/daily-outstanding',parent:'daily-maintenance',name:'Daily Outstanding'},
 {id:'daily-maintenance/unit-history',parent:'daily-maintenance',name:'Unit History'},
 {id:'daily-maintenance/daily-activity',parent:'daily-maintenance',name:'Daily Activity'},
 {id:'daily-maintenance/kpi-dm',parent:'daily-maintenance',name:'KPI Daily Maintenance'},
 {id:'settings/profile',parent:'settings',name:'My Profile'},
 {id:'settings/user-management',parent:'settings',name:'User Management'},
 {id:'settings/access-settings',parent:'settings',name:'Access Settings'},
 {id:'settings/system-settings',parent:'settings',name:'System Settings'}
];
// Aturan dasar wajib berasal dari pemilik modul, bukan disimpulkan dari UI.
window.HEXA_ACCESS_BASELINE = Object.assign({
 'settings': Object.fromEntries(['1','2','3','4','5','6'].map(r=>[r,['view']])),
 'settings/profile': Object.fromEntries(['1','2','3','4','5','6'].map(r=>[r,['view','edit']])),
 'settings/user-management': {'1':['view','add','edit','delete','manage']},
 'settings/system-settings': {'1':['view','edit','manage']}
},window.HEXA_ACCESS_BASELINE || {});
// Contoh integrasi modul: HEXA_ACCESS_BASELINE['some-feature']={ '1':['view','add'], '5':['view'] };
