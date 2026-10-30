// HEXA GLOBAL MENU REGISTRY
"use strict";
window.HEXA_MENU = [
  {id:"daily-maintenance",name:"Daily Maintenance",icon:"hexa-icon-svg-dailymaintenance.svg",url:"/daily-maintenance",order:1,enabled:true},
  {id:"backlog-monitoring",name:"Backlog Monitoring",icon:"hexa-icon-svg-backlogmonitoring.svg",url:"/backlog-monitoring",order:2,enabled:true},
  {id:"fui",name:"FUI",icon:"hexa-icon-svg-fui.svg",url:"/fui",order:3,enabled:true},
  {id:"rotable",name:"Rotable",icon:"hexa-icon-svg-rotable.svg",url:"/rotable",order:4,enabled:false},
  {id:"news",name:"News",icon:"hexa-icon-svg-news.svg",url:"/news",order:5,enabled:false},
  {id:"hexa-games",name:"HEXA GAMES",icon:"hexa-icon-svg-games.svg",url:"/hexa-games",order:6,enabled:false},
  {id:"settings",name:"Settings",icon:"hexa-icon-svg-settings.svg",url:"/settings",order:7,enabled:true}
];
window.HEXA_MENU.sort((a,b)=>a.order-b.order);
window.getHexaMenus=()=>window.HEXA_MENU;
window.getHexaMenu=id=>window.HEXA_MENU.find(m=>m.id===id);
window.getEnabledHexaMenus=()=>window.HEXA_MENU.filter(m=>m.enabled===true);
window.isHexaMenuEnabled=id=>Boolean(window.getHexaMenu(id)?.enabled===true);
console.log("HEXA Global Menu Ready:",window.HEXA_MENU);
