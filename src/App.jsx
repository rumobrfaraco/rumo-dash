import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, LabelList, ReferenceLine, Legend, Cell, Line } from "recharts";
 
const C={orange:"#FF8200",oL:"#FFF0E0",gray:"#6F7072",grayL:"#ECEDEC",white:"#FFFFFF",dark:"#1A1A1C",text:"#1A1A1C",border:"#DCDCDC",green:"#2E7D32",gL:"#E8F5E9",red:"#C62828",rL:"#FFEBEE",blue:"#1565C0",bL:"#E3F2FD",amber:"#E65100",aL:"#FFF3E0",teal:"#00695C",shadow:"0 1px 3px rgba(0,0,0,0.08)"};
const FONT="'Noto Sans',system-ui,sans-serif";
const F={ID:0,NOME:1,RESP:2,ETAPA:3,ESTADO:4,PERFIL:5,MOTIVO:6,DPRIMEIRO:7,DREUNIAO:8,SOLDOC:9,DFECH:10};
const P={ID:0,EMPRESA:1,PARCEIRO:2,STATUS:3,ETAPA:4,MOTIVO:5,FONTE:6,RESP:7,PAIS:8,UF:9,MESO:10,PERFIL:11,REUNIAO:12,DECISOR:13,FROTA:14,DATA_IND:15,DATA_REUN:16,CONTRATO:17,ANO:18,MES:19};
const MONTHS_KEY=['2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03'];
const MONTHS_LBL=['Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25','Jan/26','Fev/26','Mar/26'];
const ALL_MONTH_OPTS=[{key:'',label:'Todos os meses'},...MONTHS_KEY.map((k,i)=>({key:k,label:MONTHS_LBL[i]}))];
const ETAPA_ORDER=['Entrada','Follow-up Inicial','Reuniao Agendada','Reuniao Realizada','Raio-X','Diagnostico','Solicitacao de Documentos','Apresentacao','Proposta','Negociacao','Fechamento'];
const PARTNER_COLORS={"FB Consult":C.orange,"4DGroup":"#4A4B4D","Saionara | Raster GR":"#8C5200","Anderson FF":"#A0A0A0","Daniel | Raster":"#6F7072","Eusimar | Raster":"#333333","Sem parceiro":"#C0C0C0"};
const META_DIA=25,META_AGEND_MES=20;
const STATUS_REALIZADA="Reuniao Realizada";
const STATUS_AGENDADA="Reuniao Agendada";
const pctN=(a,b)=>b>0?+(a/b*100).toFixed(1):0;
function inRange(s,ini,fim){if(!s)return false;const d=s.slice(0,10);if(ini&&d<ini)return false;if(fim&&d>fim)return false;return true;}
const mo=s=>s&&s.length>=7?s.slice(0,7):null;
 
const EXEC_METAS=[
  {nome:"Sandro Casagrande",alias:"Sandro",color:C.orange,metaVisitas:10,metaVisitasAnual:110,metaContratos:11,metaVisitasMar:10,metaContratosMes:1},
  {nome:"Carla Cristina Lemes",alias:"Carla",color:C.blue,metaVisitas:10,metaVisitasAnual:110,metaContratos:11,metaVisitasMar:10,metaContratosMes:1},
  {nome:"Isaac Santos",alias:"Isaac",color:"#2E7D32",metaVisitas:5,metaVisitasMar:5,metaVisitasAnual:85,metaContratos:9,metaContratosMes:1},
  {nome:"Marco",alias:"Marco",color:C.gray,metaVisitas:5,metaVisitasMar:5,metaVisitasAnual:85,metaContratos:9,metaContratosMes:1},
];
 
const RAW=[[1,'2E TRANSPORTES - PME','Karoliny','Entrada','Em Andamento','PME','','','','',''],[2,'3 W TRANSPORTES','Sandro Casagrande','Entrada','Em Andamento','PME','','','','',''],[4,'3ZX TRANSPORTES - ETP','Carla Cristina Lemes','Solicitacao de Documentos','Em Andamento','ETP','','2025-10-28','2025-11-07','2025-11-12',''],[20,'ADM LOGISTICA - ETP','Sandro Casagrande','Reuniao Realizada','Perdida','ETP','Sem Interesse','2025-07-01','2025-09-02','','2025-11-19'],[29,'AGRO RIO - ETP','Carla Cristina Lemes','Diagnostico','Em Andamento','ETP','','2025-06-16','2025-09-16','2025-09-17',''],[57,'ANACIREMA TRANSPORTES - ETP','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-08-26','2025-08-29','',''],[58,'ANALOG TRANSPORTES - ETP','Sandro Casagrande','Reuniao Realizada','Perdida','ETP','Sem retorno','2025-06-04','2025-07-11','','2026-02-05'],[65,'APK LOGISTICA - ETP','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-06-17','2025-06-17','',''],[74,'ARJ TRANSPORTES - ETP','Lucas Cavalcante','Reuniao Realizada','Perdida','ETP','Sem retorno','2025-09-05','2025-09-25','','2025-12-16'],[80,'ASTUTI TRANSPORTE - ETP','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-06-02','2026-02-19','',''],[85,'AVENORTE AVICOLA - ETP','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-05-24','','',''],[88,'AXON LOGISTICA - ETP','Lucas Cavalcante','Reuniao Realizada','Perdida','ETP','Sem Interesse','2025-09-19','2025-09-18','','2025-11-25'],[93,'BANDEIRA TRANSPORTES - ETP','Sandro Casagrande','Reuniao Realizada','Em Andamento','ETP','','2025-10-21','2025-10-22','',''],[107,'BENDO LOGISTICA - ETP','Sandro Casagrande','Proposta','Em Andamento','ETP','','2025-05-09','2025-12-09','2025-05-13',''],[143,'BUZIN TRANSPORTES - ETP','Sandro Casagrande','Reuniao Realizada','Em Andamento','ETP','','2025-12-08','2025-12-08','',''],[177,'CEU AZUL TRANSPORTES - ETP','Sandro Casagrande','Fechamento','Vendida','ETP','','','2025-12-15','2025-12-15','2026-01-19'],[230,'DAMACEL TRANSPORTES - ETP','Sandro Casagrande','Negociacao','Perdida','ETP','Sem Interesse','2025-07-21','2025-10-30','2025-11-24','2026-02-06'],[238,'DEXLOG TRANSPORTE - ETP','Sandro Casagrande','Diagnostico','Em Andamento','ETP','','2025-11-26','2025-11-14','2025-11-18',''],[253,'DRUGOVICH TRANSPORTES','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-09-11','2025-09-10','',''],[326,'FRETOU BRASIL - PME','Sandro Casagrande','Reuniao Realizada','Em Andamento','PME','','2025-11-26','2025-11-26','',''],[360,'GRAO VALLE - PME','Sandro Casagrande','Fechamento','Vendida','PME','','','2025-10-16','','2026-02-13'],[377,'GUILHERME ATACAMA - ETP','Sandro Casagrande','Fechamento','Vendida','ETP','','','2026-02-20','2026-02-24','2026-02-26'],[419,'J&J TRANSPORTES - PME','Carla Cristina Lemes','Fechamento','Vendida','PME','','2025-05-10','2025-07-25','2025-02-27','2026-01-05'],[451,'JUND TRANSPORTES - PME','Sandro Casagrande','Fechamento','Vendida','PME','','','2025-12-15','2025-12-15','2026-02-12'],[499,'LOTH TRANSPORTES','Rafael Brito','Fechamento','Vendida','PME','','','2026-01-12','','2026-01-30'],[507,'LUCESI TRANSPORTES - ETP','Sandro Casagrande','Reuniao Realizada','Em Andamento','ETP','','2026-02-25','2026-02-25','',''],[560,'MENDES KOCH - ETP','Sandro Casagrande','Reuniao Realizada','Em Andamento','ETP','','2025-06-20','','',''],[574,'MODO AGROLOGISTICA - ETP','Carla Cristina Lemes','Diagnostico','Em Andamento','ETP','','2025-05-14','2025-09-18','2025-09-24',''],[596,'NATAL TRANSPORTES - PME','Sandro Casagrande','Negociacao','Em Andamento','PME','','2025-08-26','2025-08-26','',''],[656,'PIANETTO TRANSPORTES - ETP','Sandro Casagrande','Negociacao','Em Andamento','ETP','','2025-06-27','2025-06-30','2025-06-30',''],[665,'PONTAL LOGISTICA - PME','Sandro Casagrande','Reuniao Realizada','Em Andamento','PME','','2026-01-29','2026-01-27','',''],[720,'RIO PARDO TRANSPORTES - ETP','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-11-27','2025-12-18','',''],[735,'RODO WALL - ETP','Sandro Casagrande','Reuniao Realizada','Em Andamento','ETP','','2025-08-04','2025-12-18','',''],[746,'RODOCELL TRANSPORTE - ETP','Sandro Casagrande','Negociacao','Em Andamento','ETP','','2025-11-18','2025-11-21','2025-11-21',''],[789,'RODOXISTO TRANSPORTES - ETP','Sandro Casagrande','Diagnostico','Em Andamento','ETP','','2025-12-17','2026-01-13','2026-01-13',''],[811,'S E TRANSPORTES - ETP','Sandro Casagrande','Negociacao','Em Andamento','ETP','','2025-05-06','2025-07-01','2025-10-10',''],[845,'SGT LOG - ETP','Carla Cristina Lemes','Solicitacao de Documentos','Em Andamento','ETP','','2025-08-29','2025-09-09','2025-11-11',''],[859,'SOMERLOG - ETP','Carla Cristina Lemes','Reuniao Realizada','Em Andamento','ETP','','2025-06-20','2025-06-25','',''],[905,'THEO TRANSPORTES - ETP','Sandro Casagrande','Reuniao Realizada','Em Andamento','ETP','','2025-07-31','2025-08-06','',''],[1062,'TRANSPORTADORA HAMMES - ETP','Sandro Casagrande','Diagnostico','Em Andamento','ETP','','2025-08-29','2026-01-29','2026-01-29',''],[1150,'TRANSPORTES BRASIL - ETP','Carla Cristina Lemes','Diagnostico','Em Andamento','ETP','','2025-08-27','2025-08-27','2025-08-27',''],[1274,'TRILHA TRANSPORTES - PME','Barbara Novato','Proposta','Em Andamento','PME','','2025-10-03','2025-10-03','',''],[1320,'VITORIA PROVEDORA - ETP','Sandro Casagrande','Apresentacao','Em Andamento','ETP','','2025-10-02','2025-12-08','2025-12-10',''],[1339,'FUTURO LOGISTICA - ETP','Sandro Casagrande','Fechamento','Vendida','ETP','','2025-05-22','2026-01-09','2025-05-10','2026-01-09'],
[9999,'NOVO CONTRATO MAR - ETP','Sandro Casagrande','Fechamento','Vendida','ETP','','','2026-03-01','','2026-03-26']];
 
const PARCERIAS_RAW=[
  [1,"BENINI TRANSPORTES","Saionara | Raster GR","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","PR","PR - Sudoeste","ENTERPRISE","Nao","Nao Informado","Nao Informado","24/11/2025","","Nao",2025,11],
  [2,"BIZARI TRANSPORTES","FB Consult","Perdida","Reuniao Realizada","Sem retorno","Indicacao por Parceiros","Sandro Casagrande","Brasil","GO","GO - Sul","PME","Sim","Sim","0 a 50 caminhoes","05/05/2025","22/05/2025","Nao",2025,5],
  [3,"BORGNO TRANSPORTES","Anderson FF","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Rafael Brito","Brasil","BA","BA - Extremo Oeste","ENTERPRISE","Nao","Nao Informado","Nao Informado","09/07/2025","","Nao",2025,7],
  [4,"C & L TRANSPORTES","Sem parceiro","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","MG","MG - Triangulo Mineiro/Alto Paraiba","PME","Sim","Sim","0 a 50 caminhoes","13/11/2025","16/11/2025","Nao",2025,11],
  [5,"ERS TRANSPORTES LTDA","Anderson FF","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Cavalcante","Brasil","PR","PR - Metropolitana CWB","ENTERPRISE","Nao","Nao Informado","Nao Informado","06/05/2025","","Nao",2025,5],
  [6,"EXPRESSO DESCALVADO","4DGroup","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","","Nao Informado","ENTERPRISE","Sim","Sim","Nao Informado","06/05/2025","","Nao",2025,5],
  [7,"FALCON TRANSPORTES","Anderson FF","Perdida","Follow-up Inicial","Ja possui consultoria","Indicacao por Parceiros","Sandro Casagrande","Brasil","PR","PR - Metropolitana CWB","ENTERPRISE","Nao","Nao Informado","Nao Informado","06/05/2025","","Nao",2025,5],
  [8,"FRETOU BRASIL TRANSPORTES","Sem parceiro","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","SC","SC - Oeste","PME","Sim","Sim","0 a 50 caminhoes","26/11/2025","26/11/2025","Nao",2025,11],
  [9,"GOVEIA RODRIGUES TRANSPORTES","FB Consult","Em Andamento","Proposta","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","SP","SP - Assis","PME","Sim","Sim","0 a 50 caminhoes","14/08/2025","19/08/2025","Nao",2025,8],
  [10,"GRAOCAL TRANSPORTES","FB Consult","Em Andamento","Proposta","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","MT","MT - Norte","PME","Sim","Sim","Nao Informado","28/07/2025","30/07/2025","Nao",2025,7],
  [11,"LOG20 LOGISTICA","Saionara | Raster GR","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","SC","SC - Oeste","ENTERPRISE","Nao","Nao Informado","Nao Informado","17/07/2025","","Nao",2025,7],
  [12,"MOREIRA TRANSPORTES","FB Consult","Em Andamento","Negociacao","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","SP","SP - Campinas","PME","Sim","Sim","0 a 50 caminhoes","30/01/2025","30/01/2025","Nao",2025,1],
  [13,"MOVIMENTA LOG","4DGroup","Perdida","Negociacao","Sem Budget","Indicacao por Parceiros","Sandro Casagrande","Brasil","","Nao Informado","PME","Sim","Sim","Nao Informado","05/05/2025","","Nao",2025,5],
  [14,"NAYR TRANSPORTES","FB Consult","Em Andamento","Proposta","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","","Nao Informado","PME","Sim","Sim","Nao Informado","05/05/2025","28/07/2025","Nao",2025,5],
  [15,"PONTAL LOGISTICA","FB Consult","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","GO","GO - Centro","PME","Sim","Sim","0 a 50 caminhoes","27/01/2026","29/01/2026","Nao",2025,1],
  [16,"R C TRANSPORTES","Anderson FF","Em Andamento","Apresentacao","0","Indicacao por Parceiros","Carla Cristina Lemes","Brasil","PR","PR - Oeste","ENTERPRISE","Nao","Sim","Nao Informado","10/06/2025","","Nao",2025,6],
  [17,"RM TRANSPORTES","FB Consult","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","","Nao Informado","PME","Sim","Sim","Nao Informado","05/05/2025","","Nao",2025,5],
  [18,"RODORIBEIRO TRANSPORTES","Saionara | Raster GR","Perdida","Follow-up Inicial","Sem Interesse no momento","Indicacao por Parceiros","Sandro Casagrande","Brasil","PR","PR - Noroeste","ENTERPRISE","Nao","Nao Informado","Nao Informado","11/07/2025","","Nao",2025,7],
  [19,"RODOSAFRA","Anderson FF","Perdida","Solicitacao de Documentos","Sem Interesse no momento","Indicacao por Parceiros","Sandro Casagrande","Brasil","MG","MG - Metropolitana BH","ENTERPRISE","Sim","Sim","0 a 50 caminhoes","06/05/2025","","Nao",2025,5],
  [20,"SUDMAR TRANSPORTES","Anderson FF","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Cavalcante","Brasil","PR","PR - Metropolitana CWB","ENTERPRISE","Nao","Nao Informado","Nao Informado","06/05/2025","","Nao",2025,5],
  [21,"TRANSLOG","Anderson FF","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Cavalcante","Brasil","PR","PR - Metropolitana CWB","ENTERPRISE","Nao","Nao Informado","Nao Informado","06/05/2025","","Nao",2025,5],
  [22,"TRANSPORTADORA PRINT LTDA","FB Consult","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","SP","SP - Campinas","ENTERPRISE","Sim","Sim","Acima de 200 caminhoes","30/05/2025","","Nao",2025,5],
  [23,"OVOS AVINE","FB Consult","Em Andamento","Diagnostico","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","","Nao Informado","ENTERPRISE","Nao","Sim","Nao Informado","06/05/2025","04/07/2025","Nao",2025,5],
  [24,"TRANSGOSS","Saionara | Raster GR","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","PR","PR - Sudoeste","ENTERPRISE","Sim","Sim","Nao Informado","11/07/2025","10/09/2025","Nao",2025,7],
  [25,"UNILOG","FB Consult","Perdida","Negociacao","Sem Interesse no momento","Indicacao por Parceiros","Sandro Casagrande","Brasil","MG","MG - Triangulo Mineiro/Alto Paraiba","ENTERPRISE","Sim","Sim","50 a 100 caminhoes","11/06/2025","02/02/2025","Nao",2025,6],
  [26,"LVA TRANSPORTES","4DGroup","Perdida","Solicitacao de Documentos","Sem retorno","Indicacao por Parceiros","Sandro Casagrande","Brasil","","Nao definida","ENTERPRISE","Sim","Sim","100 a 200 caminhoes","06/05/2025","04/02/2025","Nao",2025,5],
  [27,"TRANSPORTADORA BOA VIAGEM","Anderson FF","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Carla Cristina Lemes","Brasil","","Nao Informado","ENTERPRISE","Sim","Sim","Nao Informado","20/06/2025","16/03/2025","Nao",2025,6],
  [28,"EXPRESSO GONCALVES TRANSPORTES LTDA","4DGroup","Perdida","Solicitacao de Documentos","Sem retorno","Indicacao por Parceiros","Sandro Casagrande","Brasil","PE","PE - Metropolitana Recife","ENTERPRISE","Sim","Sim","0 a 50 caminhoes","06/05/2025","08/06/2025","Nao",2025,5],
  [29,"MASTER TRANSPORTADORA","4DGroup","Perdida","Fechamento","Sem retorno","Indicacao por Parceiros","Sandro Casagrande","Brasil","SP","SP - Campinas","ENTERPRISE","Sim","Sim","0 a 50 caminhoes","10/06/2025","10/06/2025","Nao",2025,6],
  [30,"LARIFO TRANSPORTES","Saionara | Raster GR","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","SC","SC - Oeste","ENTERPRISE","Sim","Nao","Acima de 200 caminhoes","28/06/2025","26/06/2025","Nao",2025,6],
  [31,"MATLOG TRANSPORTES","FB Consult","Perdida","Reuniao Realizada","Outro motivo nao listado","Indicacao por Parceiros","Sandro Casagrande","Brasil","SC","SC - Sul Catarinense","ENTERPRISE","Sim","Sim","Nao Informado","28/11/2025","27/08/2025","Nao",2025,11],
  [32,"ADM LOGISTICA E TRANSPORTES","Saionara | Raster GR","Perdida","Reuniao Realizada","Sem Interesse no momento","Indicacao por Parceiros","Sandro Casagrande","Brasil","SC","SC - Oeste","ENTERPRISE","Sim","Sim","0 a 50 caminhoes","01/07/2025","02/09/2025","Nao",2025,7],
  [33,"A J S TUR","Sem parceiro","Em Andamento","Solicitacao de Documentos","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","RS","RS - Noroeste","ENTERPRISE","Sim","Sim","100 a 200 caminhoes","10/07/2025","05/09/2025","Nao",2025,7],
  [34,"BUDEL TRANSPORTES","4DGroup","Perdida","Solicitacao de Documentos","Ja possui consultoria","Indicacao por Parceiros","Lucas Cavalcante","Brasil","PR","PR - Metropolitana CWB","ENTERPRISE","Sim","Sim","Acima de 200 caminhoes","23/12/2025","17/09/2025","Nao",2025,12],
  [35,"DAMACEL TRANSPORTES","FB Consult","Em Andamento","Negociacao","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","RS","RS - Nordeste","ENTERPRISE","Sim","Sim","0 a 50 caminhoes","21/07/2025","30/10/2025","Nao",2025,7],
  [36,"VITORIA PROVEDORA LOGISTICA","Sem parceiro","Em Andamento","Apresentacao","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","RS","RS - Metropolitana POA","ENTERPRISE","Nao","Sim","Acima de 200 caminhoes","02/10/2025","08/12/2025","Nao",2025,10],
  [37,"RODO WALL","4DGroup","Em Andamento","Reuniao Realizada","0","Indicacao por Parceiros","Lucas Cavalcante","Brasil","PR","PR - Metropolitana CWB","ENTERPRISE","Sim","Sim","100 a 200 caminhoes","04/08/2025","18/12/2025","Nao",2025,8],
  [38,"TRANSPORTADORA HAMMES LTDA","FB Consult","Em Andamento","Solicitacao de Documentos","0","Indicacao por Parceiros","Sandro Casagrande","Brasil","RS","RS - Sudeste","ENTERPRISE","Sim","Sim","Acima de 200 caminhoes","29/08/2025","29/01/2026","Nao",2025,8],
  [39,"TRANSJORGIS","Daniel | Raster","Em Andamento","Solicitacao de Documentos","0","Indicacao por Parceiros","Lucas Faraco","Brasil","PR","PR - Centro Oriental","PME","Sim","Sim","0 a 50 caminhoes","23/02/2026","27/02/2026","Nao",2026,2],
  [40,"KADOSH","Daniel | Raster","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Faraco","Brasil","PR","PR - Centro Oriental","ENTERPRISE","Nao","Nao","0","23/02/2026","24/02/2026","Nao",2026,2],
  [41,"NOVAMEL","Daniel | Raster","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Faraco","Brasil","PR","PR - Centro Oriental","PME","Nao","Nao","0","23/02/2026","24/02/2026","Nao",2026,2],
  [42,"RACSO","Daniel | Raster","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Faraco","Brasil","PR","PR - Centro Oriental","ENTERPRISE","Nao","Nao","0","23/02/2026","24/02/2026","Nao",2026,2],
  [43,"BOA VIAGEM","Daniel | Raster","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Faraco","Brasil","PR","PR - Centro Oriental","ENTERPRISE","Nao","Nao","0","23/02/2026","24/02/2026","Nao",2026,2],
  [44,"TRANSPORTADORA CORTESIA","Daniel | Raster","Em Andamento","Follow-up Inicial","0","Indicacao por Parceiros","Lucas Faraco","Brasil","PR","PR - Centro Oriental","PME","Nao","Nao","0","23/02/2026","24/02/2026","Nao",2026,2],
];
 
const SDR_AGENDAMENTOS=[
  {empresa:'A.BECCHI & CIA',perfil:'PME',status:STATUS_REALIZADA,crm:'Perdida',motivo:'Sem Interesse no Momento',dataAgend:'2026-03-16'},
  {empresa:'PARCEIRO DO GRAO LOGISTICA',perfil:'PME',status:STATUS_AGENDADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-16'},
  {empresa:'GOMES E ALVES TRANSPORTES LTDA',perfil:'PME',status:STATUS_AGENDADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-17'},
  {empresa:'EXPRESSO RODOFRIO',perfil:'PME',status:STATUS_REALIZADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-17'},
  {empresa:'DIAMANTE S/A',perfil:'ETP',status:STATUS_AGENDADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-18'},
  {empresa:'GRUPO DTRANS',perfil:'PME',status:STATUS_REALIZADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-19',etapaCrm:'Negociacao'},
  {empresa:'EXPRESSO 9002 TRANSPORTES',perfil:'PME',status:STATUS_REALIZADA,crm:'Perdida',motivo:'Sem Interesse no Momento',dataAgend:'2026-03-23'},
  {empresa:'VIA TERRESTRE TRANSPORTE E LOGISTICA',perfil:'PME',status:STATUS_REALIZADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-23'},
  {empresa:'RTT LOG',perfil:'PME',status:STATUS_REALIZADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-23',etapaCrm:'Proposta'},
  {empresa:'ENI TRANSPORTES',perfil:'PME',status:STATUS_AGENDADA,crm:'Em Andamento',motivo:'',dataAgend:'2026-03-24'},
];
 
const SDR_MOV=[
  {dia:'02/mar',data:'2026-03-02',mov:0},{dia:'03/mar',data:'2026-03-03',mov:0},{dia:'04/mar',data:'2026-03-04',mov:0},{dia:'05/mar',data:'2026-03-05',mov:0},{dia:'06/mar',data:'2026-03-06',mov:0},{dia:'07/mar',data:'2026-03-07',mov:0},{dia:'08/mar',data:'2026-03-08',mov:0},{dia:'09/mar',data:'2026-03-09',mov:0},{dia:'10/mar',data:'2026-03-10',mov:0},
  {dia:'11/mar',data:'2026-03-11',mov:18},{dia:'12/mar',data:'2026-03-12',mov:22},{dia:'13/mar',data:'2026-03-13',mov:27},{dia:'16/mar',data:'2026-03-16',mov:9},{dia:'17/mar',data:'2026-03-17',mov:16},{dia:'18/mar',data:'2026-03-18',mov:21},{dia:'19/mar',data:'2026-03-19',mov:26},{dia:'20/mar',data:'2026-03-20',mov:29},{dia:'23/mar',data:'2026-03-23',mov:8},{dia:'24/mar',data:'2026-03-24',mov:16},{dia:'25/mar',data:'2026-03-25',mov:39},{dia:'26/mar',data:'2026-03-26',mov:25},{dia:'27/mar',data:'2026-03-27',mov:14},
];
 
const SDR_SEMANAS=[
  {semana:'S1 (11-13/mar)',ligacoes:18+22+27,agendamentos:1},
  {semana:'S2 (16-20/mar)',ligacoes:9+16+10+21+14,agendamentos:5},
  {semana:'S3 (23/mar)',ligacoes:31,agendamentos:3},
];
 
const SDR_DAYS_LBL=['11/mar','12/mar','13/mar','16/mar','17/mar','18/mar','19/mar','20/mar','23/mar','24/mar','25/mar','26/mar','27/mar'];
const SDR_LIG_DIA=[0,0,27,9,16,10,21,14,31,14,14,29,15];
const SDR_EML_DIA=[0,22,0,0,0,11,5,0,3,8,7,1,2];
const SDR_WHA_DIA=[0,0,0,0,0,0,0,15,15,12,18,27,9];

const SDR_AGEND_POR_DATA = {};
SDR_AGENDAMENTOS.forEach(a => {
  if (a.dataAgend) {
    SDR_AGEND_POR_DATA[a.dataAgend] = (SDR_AGEND_POR_DATA[a.dataAgend] || 0) + 1;
  }
});

const SDR_ATIV_DATES = [
  '2026-03-11','2026-03-12','2026-03-13',
  '2026-03-16','2026-03-17','2026-03-18','2026-03-19','2026-03-20',
  '2026-03-23','2026-03-24','2026-03-25','2026-03-26','2026-03-27'
];

const SDR_AGEND_ACUM = (() => {
  let acc = 0;
  return SDR_ATIV_DATES.map(date => {
    acc += (SDR_AGEND_POR_DATA[date] || 0);
    return acc;
  });
})();


// ── DADOS MENSAIS COMPILADOS SDR ──────────────────
// Totais por mês (Mar/26 é o mês atual, demais a definir quando houver histórico)
const SDR_MENSAL=[
  {mes:'Mar/26',key:'2026-03',ligacao:SDR_LIG_DIA.reduce((a,b)=>a+b,0),email:SDR_EML_DIA.reduce((a,b)=>a+b,0),whatsapp:SDR_WHA_DIA.reduce((a,b)=>a+b,0),agendamentos:10},
];

function buildSdrEvol(arr){let acc=0;return arr.map(v=>{acc+=v;return acc;});}

const SDR_ATIV=[
  {data:'2026-03-11',empresa:'RT TRANSPORTES',canal:'ligacao'},
  {data:'2026-03-12',empresa:'JB TRANSPORTES',canal:'ligacao'},{data:'2026-03-12',empresa:'GABRI CARGO',canal:'ligacao'},{data:'2026-03-12',empresa:'LTSL ENCOMENDAS',canal:'email'},{data:'2026-03-12',empresa:'TSF TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-12',empresa:'RT TRANSPORTES',canal:'ligacao'},{data:'2026-03-12',empresa:'W&E TRANSPORTES',canal:'ligacao'},{data:'2026-03-12',empresa:'ALENCAR LOG',canal:'ligacao'},{data:'2026-03-12',empresa:'TRANSPORTADORA IPE',canal:'ligacao'},{data:'2026-03-12',empresa:'TWF LOGISTICA',canal:'ligacao'},{data:'2026-03-12',empresa:'ROMA TRANSPORTES',canal:'ligacao'},{data:'2026-03-12',empresa:'M ANDRADE',canal:'ligacao'},{data:'2026-03-12',empresa:'LOBS TRANSPORTES',canal:'ligacao'},{data:'2026-03-12',empresa:'A.BECCHI',canal:'email'},{data:'2026-03-12',empresa:'TRANSPEREGO',canal:'ligacao'},{data:'2026-03-12',empresa:'AGROVELOZ',canal:'ligacao'},{data:'2026-03-12',empresa:'EXPRESSO GOIAS',canal:'ligacao'},{data:'2026-03-12',empresa:'PETRA LOG',canal:'ligacao'},{data:'2026-03-12',empresa:'CELTA TRANSPORTES',canal:'ligacao'},{data:'2026-03-12',empresa:'ESPANSUL',canal:'ligacao'},{data:'2026-03-12',empresa:'DUEMAFE LOGISTICA',canal:'ligacao'},{data:'2026-03-12',empresa:'TRANSPORTADORA CLASSE A',canal:'ligacao'},{data:'2026-03-12',empresa:'J DALAVALLE',canal:'ligacao'},{data:'2026-03-12',empresa:'J DALAVALLE',canal:'email'},
  {data:'2026-03-13',empresa:'TWF LOGISTICA',canal:'ligacao'},{data:'2026-03-13',empresa:'MILLENNIUM',canal:'email'},{data:'2026-03-13',empresa:'LGP TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'LAGE LOG',canal:'email'},{data:'2026-03-13',empresa:'LALOG',canal:'email'},{data:'2026-03-13',empresa:'TWF LOGISTICA',canal:'email'},{data:'2026-03-13',empresa:'JOMAVE',canal:'email'},{data:'2026-03-13',empresa:'JAT TRANSPORTES',canal:'email'},{data:'2026-03-13',empresa:'J&P TRANSPORTADORA',canal:'email'},{data:'2026-03-13',empresa:'GUTO LOGISTICA',canal:'email'},{data:'2026-03-13',empresa:'GOMES E ALVES',canal:'email'},{data:'2026-03-13',empresa:'FERREIRA VILACA',canal:'email'},{data:'2026-03-13',empresa:'EXPRESSO RODOFRIO',canal:'email'},{data:'2026-03-13',empresa:'COMERCIAL MULT MIX',canal:'email'},{data:'2026-03-13',empresa:'ALO TRANSPORTES',canal:'email'},{data:'2026-03-13',empresa:'MCR TRANSPORTES',canal:'email'},{data:'2026-03-13',empresa:'ROMA TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'M ANDRADE',canal:'ligacao'},{data:'2026-03-13',empresa:'GABRI CARGO',canal:'ligacao'},{data:'2026-03-13',empresa:'LOBS TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'W&E TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'TSF TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-13',empresa:'TRANSPORTADORA IPE',canal:'ligacao'},{data:'2026-03-13',empresa:'DUEMAFE LOGISTICA',canal:'ligacao'},{data:'2026-03-13',empresa:'TRANSPEREGO',canal:'ligacao'},{data:'2026-03-13',empresa:'EXPRESSO GOIAS',canal:'ligacao'},{data:'2026-03-13',empresa:'JAT TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'J&P TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-13',empresa:'ALO TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'GUTO LOGISTICA',canal:'ligacao'},{data:'2026-03-13',empresa:'GOMES E ALVES',canal:'ligacao'},{data:'2026-03-13',empresa:'FERREIRA VILACA',canal:'ligacao'},{data:'2026-03-13',empresa:'EXPRESSO RODOFRIO',canal:'ligacao'},{data:'2026-03-13',empresa:'COMERCIAL MULT MIX',canal:'ligacao'},{data:'2026-03-13',empresa:'RLP TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'MILLENNIUM',canal:'ligacao'},{data:'2026-03-13',empresa:'MCR TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'LGP TRANSPORTES',canal:'ligacao'},{data:'2026-03-13',empresa:'LALOG',canal:'ligacao'},{data:'2026-03-13',empresa:'LAGE LOG',canal:'ligacao'},{data:'2026-03-13',empresa:'JOMAVE',canal:'ligacao'},{data:'2026-03-13',empresa:'PARCEIRO DO GRAO',canal:'ligacao'},
  {data:'2026-03-16',empresa:'JOMAVE',canal:'ligacao'},{data:'2026-03-16',empresa:'MCR TRANSPORTES',canal:'ligacao'},{data:'2026-03-16',empresa:'LAGE LOG',canal:'ligacao'},{data:'2026-03-16',empresa:'GUTO LOGISTICA',canal:'ligacao'},{data:'2026-03-16',empresa:'JAT TRANSPORTES',canal:'ligacao'},{data:'2026-03-16',empresa:'GOMES E ALVES',canal:'ligacao'},{data:'2026-03-16',empresa:'FERREIRA VILACA',canal:'ligacao'},{data:'2026-03-16',empresa:'ALO TRANSPORTES',canal:'ligacao'},{data:'2026-03-16',empresa:'MILLENNIUM',canal:'ligacao'},{data:'2026-03-16',empresa:'EXPRESSO RODOFRIO',canal:'ligacao'},{data:'2026-03-16',empresa:'COMERCIAL MULT MIX',canal:'ligacao'},{data:'2026-03-16',empresa:'J&P TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-16',empresa:'GABRI CARGO',canal:'ligacao'},{data:'2026-03-16',empresa:'M ANDRADE',canal:'ligacao'},{data:'2026-03-16',empresa:'TWF LOGISTICA',canal:'ligacao'},{data:'2026-03-16',empresa:'PARCEIRO DO GRAO',canal:'ligacao'},{data:'2026-03-16',empresa:'ROMA TRANSPORTES',canal:'ligacao'},{data:'2026-03-16',empresa:'RLP TRANSPORTES',canal:'ligacao'},{data:'2026-03-16',empresa:'MILLENNIUM',canal:'email'},{data:'2026-03-16',empresa:'J&P TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-16',empresa:'GOMES E ALVES',canal:'ligacao'},{data:'2026-03-16',empresa:'A.BECCHI',canal:'ligacao'},
  {data:'2026-03-17',empresa:'J DALAVALLE',canal:'ligacao'},{data:'2026-03-17',empresa:'LGP TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'DUEMAFE LOGISTICA',canal:'ligacao'},{data:'2026-03-17',empresa:'EXPRESSO RODOFRIO',canal:'ligacao'},{data:'2026-03-17',empresa:'GUTO LOGISTICA',canal:'ligacao'},{data:'2026-03-17',empresa:'J&P TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-17',empresa:'DIAMANTE',canal:'email'},{data:'2026-03-17',empresa:'LALOG',canal:'ligacao'},{data:'2026-03-17',empresa:'EXPRESSO GOIAS',canal:'email'},{data:'2026-03-17',empresa:'ESPANSUL',canal:'email'},{data:'2026-03-17',empresa:'J DALAVALLE',canal:'email'},{data:'2026-03-17',empresa:'LAGE LOG',canal:'ligacao'},{data:'2026-03-17',empresa:'TRANSPORTADORA CLASSE A',canal:'email'},{data:'2026-03-17',empresa:'JOMAVE',canal:'ligacao'},{data:'2026-03-17',empresa:'JAT TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'A.BECCHI',canal:'email'},{data:'2026-03-17',empresa:'CELTA TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'W&E TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'LOBS TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'RLP TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'MILLENNIUM',canal:'email'},{data:'2026-03-17',empresa:'J&P TRANSPORTADORA',canal:'email'},{data:'2026-03-17',empresa:'RT TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'LGP TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'SUPERIOR TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'ALO TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'W&E TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'LOBS TRANSPORTES',canal:'email'},{data:'2026-03-17',empresa:'M ANDRADE',canal:'email'},{data:'2026-03-17',empresa:'UES TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'TRANSCOURIER',canal:'ligacao'},{data:'2026-03-17',empresa:'SLC TRANSPORTES',canal:'ligacao'},{data:'2026-03-17',empresa:'VKEFILHOS',canal:'ligacao'},{data:'2026-03-17',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'ligacao'},{data:'2026-03-17',empresa:'TRANSPORTADORA ASA SUL',canal:'ligacao'},{data:'2026-03-17',empresa:'VALLENCE',canal:'ligacao'},{data:'2026-03-17',empresa:'VIA TERRESTRE',canal:'ligacao'},{data:'2026-03-17',empresa:'VELOZ CARGAS',canal:'ligacao'},{data:'2026-03-17',empresa:'UNICA TRANSPORTES',canal:'ligacao'},
  {data:'2026-03-18',empresa:'RT TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'RLP TRANSPORTES',canal:'ligacao'},{data:'2026-03-18',empresa:'MCR TRANSPORTES',canal:'ligacao'},{data:'2026-03-18',empresa:'TRANSPORTADORA IPE',canal:'ligacao'},{data:'2026-03-18',empresa:'VKEFILHOS',canal:'email'},{data:'2026-03-18',empresa:'VIA TERRESTRE',canal:'email'},{data:'2026-03-18',empresa:'VELOZ CARGAS',canal:'email'},{data:'2026-03-18',empresa:'VALLENCE',canal:'email'},{data:'2026-03-18',empresa:'SIGA BRASIL',canal:'ligacao'},{data:'2026-03-18',empresa:'SGR LOGISTICA',canal:'ligacao'},{data:'2026-03-18',empresa:'UNICA TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'UES TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'EXPRESSO GOIAS',canal:'ligacao'},{data:'2026-03-18',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'email'},{data:'2026-03-18',empresa:'TRANSPORTADORA ASA SUL',canal:'email'},{data:'2026-03-18',empresa:'TRANSCOURIER',canal:'email'},{data:'2026-03-18',empresa:'ESPANSUL',canal:'ligacao'},{data:'2026-03-18',empresa:'SLC TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'SIGA BRASIL',canal:'email'},{data:'2026-03-18',empresa:'SGR LOGISTICA',canal:'email'},{data:'2026-03-18',empresa:'DIAMANTE',canal:'ligacao'},{data:'2026-03-18',empresa:'VALLENCE',canal:'ligacao'},{data:'2026-03-18',empresa:'RLP TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'MCR TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'LAGE LOG',canal:'email'},{data:'2026-03-18',empresa:'JAT TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'GUTO LOGISTICA',canal:'email'},{data:'2026-03-18',empresa:'PARCEIRO DO GRAO',canal:'ligacao'},{data:'2026-03-18',empresa:'COMERCIAL MULT MIX',canal:'email'},{data:'2026-03-18',empresa:'GABRI CARGO',canal:'email'},{data:'2026-03-18',empresa:'TWF LOGISTICA',canal:'email'},{data:'2026-03-18',empresa:'ROMA TRANSPORTES',canal:'email'},{data:'2026-03-18',empresa:'TRANSPORTADORA IPE',canal:'email'},
  {data:'2026-03-19',empresa:'VALLENCE',canal:'ligacao'},{data:'2026-03-19',empresa:'M ANDRADE',canal:'ligacao'},{data:'2026-03-19',empresa:'LOBS TRANSPORTES',canal:'ligacao'},{data:'2026-03-19',empresa:'CELTA TRANSPORTES',canal:'ligacao'},{data:'2026-03-19',empresa:'D.E.S TRANSPORTES',canal:'ligacao'},{data:'2026-03-19',empresa:'ARAGAO CAMINHOES',canal:'ligacao'},{data:'2026-03-19',empresa:'DEC LOG',canal:'ligacao'},{data:'2026-03-19',empresa:'AGROVERDE CEREAIS',canal:'ligacao'},{data:'2026-03-19',empresa:'UNICA TRANSPORTES',canal:'ligacao'},{data:'2026-03-19',empresa:'VIA TERRESTRE',canal:'ligacao'},{data:'2026-03-19',empresa:'VELOZ CARGAS',canal:'ligacao'},{data:'2026-03-19',empresa:'FERREIRA VILACA',canal:'ligacao'},{data:'2026-03-19',empresa:'3 W TRANSPORTES',canal:'ligacao'},{data:'2026-03-19',empresa:'SLC TRANSPORTES',canal:'ligacao'},{data:'2026-03-19',empresa:'SIGA BRASIL',canal:'ligacao'},{data:'2026-03-19',empresa:'ARROW LOGISTICA',canal:'ligacao'},{data:'2026-03-19',empresa:'DINIZ SARAIVA',canal:'ligacao'},{data:'2026-03-19',empresa:'GRUPO DTRANS',canal:'ligacao'},{data:'2026-03-19',empresa:'EXPRESSO 9002',canal:'ligacao'},{data:'2026-03-19',empresa:'FENIX WAY',canal:'ligacao'},{data:'2026-03-19',empresa:'TRANSPORTE RICARDO ROSA',canal:'ligacao'},{data:'2026-03-19',empresa:'MILLENNIUM',canal:'email'},{data:'2026-03-19',empresa:'PETRA LOG',canal:'email'},{data:'2026-03-19',empresa:'LGP TRANSPORTES',canal:'email'},{data:'2026-03-19',empresa:'ALO TRANSPORTES',canal:'email'},{data:'2026-03-19',empresa:'FELLON TRANSPORTES',canal:'email'},{data:'2026-03-19',empresa:'TRANSPORTE RICARDO ROSA',canal:'email'},{data:'2026-03-19',empresa:'J&P TRANSPORTADORA',canal:'email'},{data:'2026-03-19',empresa:'FERREIRA VILACA',canal:'email'},{data:'2026-03-19',empresa:'3 W TRANSPORTES',canal:'email'},{data:'2026-03-19',empresa:'HOLIVER TRANSPORTES',canal:'email'},{data:'2026-03-19',empresa:'GRUPO DTRANS',canal:'email'},{data:'2026-03-19',empresa:'FENIX WAY',canal:'email'},{data:'2026-03-19',empresa:'EXPRESSO 9002',canal:'email'},{data:'2026-03-19',empresa:'D.E.S TRANSPORTES',canal:'whatsapp'},{data:'2026-03-19',empresa:'ARROW LOGISTICA',canal:'whatsapp'},{data:'2026-03-19',empresa:'ARAGAO CAMINHOES',canal:'whatsapp'},{data:'2026-03-19',empresa:'AGROVERDE CEREAIS',canal:'whatsapp'},{data:'2026-03-19',empresa:'FELLON TRANSPORTES',canal:'whatsapp'},{data:'2026-03-19',empresa:'CELTA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-19',empresa:'M ANDRADE',canal:'whatsapp'},{data:'2026-03-19',empresa:'VIA TERRESTRE',canal:'whatsapp'},{data:'2026-03-19',empresa:'TRANSPORTE RICARDO ROSA',canal:'whatsapp'},{data:'2026-03-19',empresa:'UNICA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-19',empresa:'GRUPO DTRANS',canal:'whatsapp'},{data:'2026-03-19',empresa:'VELOZ CARGAS',canal:'whatsapp'},{data:'2026-03-19',empresa:'3 W TRANSPORTES',canal:'whatsapp'},{data:'2026-03-19',empresa:'EXPRESSO 9002',canal:'whatsapp'},
  {data:'2026-03-20',empresa:'AGROVELOZ',canal:'whatsapp'},{data:'2026-03-20',empresa:'LGP TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'ALO TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'whatsapp'},{data:'2026-03-20',empresa:'TRANSCOURIER',canal:'whatsapp'},{data:'2026-03-20',empresa:'HOLIVER TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'FENIX WAY',canal:'whatsapp'},{data:'2026-03-20',empresa:'J&P TRANSPORTADORA',canal:'whatsapp'},{data:'2026-03-20',empresa:'SLC TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'TSF TRANSPORTADORA',canal:'whatsapp'},{data:'2026-03-20',empresa:'SIGA BRASIL',canal:'whatsapp'},{data:'2026-03-20',empresa:'LOBS TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'TRANSPEREGO',canal:'whatsapp'},{data:'2026-03-20',empresa:'UNICA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'JAT TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'GUTO LOGISTICA',canal:'whatsapp'},{data:'2026-03-20',empresa:'MCR TRANSPORTES',canal:'whatsapp'},{data:'2026-03-20',empresa:'LAGE LOG',canal:'whatsapp'},{data:'2026-03-20',empresa:'PETRA LOG',canal:'whatsapp'},{data:'2026-03-20',empresa:'EXPRESSO GOIAS',canal:'ligacao'},{data:'2026-03-20',empresa:'ESPANSUL',canal:'ligacao'},{data:'2026-03-20',empresa:'CELTA TRANSPORTES',canal:'ligacao'},{data:'2026-03-20',empresa:'TRANSPEREGO',canal:'ligacao'},{data:'2026-03-20',empresa:'TRANSPORTADORA CLASSE A',canal:'ligacao'},{data:'2026-03-20',empresa:'PETRA LOG',canal:'ligacao'},{data:'2026-03-20',empresa:'TSF TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-20',empresa:'RLP TRANSPORTES',canal:'ligacao'},{data:'2026-03-20',empresa:'MCR TRANSPORTES',canal:'ligacao'},{data:'2026-03-20',empresa:'LAGE LOG',canal:'ligacao'},{data:'2026-03-20',empresa:'UNICA TRANSPORTES',canal:'ligacao'},{data:'2026-03-20',empresa:'JAT TRANSPORTES',canal:'ligacao'},{data:'2026-03-20',empresa:'GUTO LOGISTICA',canal:'ligacao'},{data:'2026-03-20',empresa:'COMERCIAL MULT MIX',canal:'ligacao'},
  {data:'2026-03-23',empresa:'FENIX WAY',canal:'ligacao'},{data:'2026-03-23',empresa:'MILLENNIUM',canal:'ligacao'},{data:'2026-03-23',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'ligacao'},{data:'2026-03-23',empresa:'VIA TERRESTRE',canal:'ligacao'},{data:'2026-03-23',empresa:'W&E TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'SLC TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'DINIZ SARAIVA',canal:'ligacao'},{data:'2026-03-23',empresa:'DEC LOG',canal:'ligacao'},{data:'2026-03-23',empresa:'TRANSCOURIER',canal:'ligacao'},{data:'2026-03-23',empresa:'D.E.S TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'ARROW LOGISTICA',canal:'ligacao'},{data:'2026-03-23',empresa:'ARAGAO CAMINHOES',canal:'ligacao'},{data:'2026-03-23',empresa:'DIAMANTE',canal:'ligacao'},{data:'2026-03-23',empresa:'ALO TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'HOLIVER TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'TRANSPORTE RICARDO ROSA',canal:'ligacao'},{data:'2026-03-23',empresa:'FELLON TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'J&P TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-23',empresa:'VELOZ CARGAS',canal:'ligacao'},{data:'2026-03-23',empresa:'3 W TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'EXPRESSO 9002',canal:'ligacao'},{data:'2026-03-23',empresa:'PRV TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'ANSELMINI',canal:'ligacao'},{data:'2026-03-23',empresa:'BMG VICENZI',canal:'ligacao'},{data:'2026-03-23',empresa:'KJUNIOR',canal:'ligacao'},{data:'2026-03-23',empresa:'M A TRANSPORTADORA',canal:'ligacao'},{data:'2026-03-23',empresa:'AGS LOG',canal:'ligacao'},{data:'2026-03-23',empresa:'ENI TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'LOG MASTER',canal:'ligacao'},{data:'2026-03-23',empresa:'ALBANI TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'CONCENTO TRANSPORTES',canal:'ligacao'},{data:'2026-03-23',empresa:'RTT LOG',canal:'whatsapp'},{data:'2026-03-23',empresa:'TRANSPORTADORA CLASSE A',canal:'whatsapp'},{data:'2026-03-23',empresa:'LOBS TRANSPORTES',canal:'whatsapp'},{data:'2026-03-23',empresa:'M ANDRADE',canal:'whatsapp'},{data:'2026-03-23',empresa:'TRANSPEREGO',canal:'whatsapp'},{data:'2026-03-23',empresa:'VIA TERRESTRE',canal:'whatsapp'},{data:'2026-03-23',empresa:'TRANSPORTADORA ASA SUL',canal:'whatsapp'},{data:'2026-03-23',empresa:'CELTA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-23',empresa:'PARCEIRO DO GRAO',canal:'whatsapp'},{data:'2026-03-23',empresa:'MCR TRANSPORTES',canal:'whatsapp'},{data:'2026-03-23',empresa:'JAT TRANSPORTES',canal:'whatsapp'},{data:'2026-03-23',empresa:'GUTO LOGISTICA',canal:'whatsapp'},{data:'2026-03-23',empresa:'TRANSPORTADORA CLASSE A',canal:'whatsapp'},{data:'2026-03-23',empresa:'DIAMANTE',canal:'email'},{data:'2026-03-23',empresa:'EXPRESSO 9002',canal:'email'},
  {data:'2026-03-24',empresa:'ENI TRANSPORTES',canal:'ligacao'},{data:'2026-03-24',empresa:'PRV TRANSPORTES',canal:'ligacao'},{data:'2026-03-24',empresa:'TSF TRANSPORTADORA SANTA FE',canal:'ligacao'},{data:'2026-03-24',empresa:'TRANSPORTADORA ASA SUL',canal:'ligacao'},{data:'2026-03-24',empresa:'SIGA BRASIL',canal:'ligacao'},{data:'2026-03-24',empresa:'LOBS TRANSPORTES',canal:'ligacao'},{data:'2026-03-24',empresa:'TRANSPEREGO',canal:'ligacao'},{data:'2026-03-24',empresa:'LGP TRANSPORTES',canal:'ligacao'},{data:'2026-03-24',empresa:'PETRA LOG',canal:'ligacao'},{data:'2026-03-24',empresa:'GABRI CARGO',canal:'ligacao'},{data:'2026-03-24',empresa:'TWF LOGISTICA',canal:'ligacao'},{data:'2026-03-24',empresa:'ROMA TRANSPORTES',canal:'ligacao'},{data:'2026-03-24',empresa:'TRANSPORTADORA IPE AMARELO',canal:'ligacao'},{data:'2026-03-24',empresa:'LOG MASTER',canal:'email'},{data:'2026-03-24',empresa:'BMG VICENZI',canal:'email'},{data:'2026-03-24',empresa:'FELLON TRANSPORTES',canal:'email'},{data:'2026-03-24',empresa:'VELOZ CARGAS',canal:'email'},{data:'2026-03-24',empresa:'UNICA TRANSPORTES',canal:'email'},{data:'2026-03-24',empresa:'PARCEIRO DO GRAO',canal:'whatsapp'},{data:'2026-03-24',empresa:'PRV TRANSPORTES',canal:'whatsapp'},{data:'2026-03-24',empresa:'GRUPO DTRANS',canal:'whatsapp'},{data:'2026-03-24',empresa:'RTT LOG',canal:'whatsapp'},{data:'2026-03-24',empresa:'AGS LOG',canal:'whatsapp'},{data:'2026-03-24',empresa:'LOBS TRANSPORTES',canal:'whatsapp'},{data:'2026-03-24',empresa:'TRANSPEREGO',canal:'whatsapp'},{data:'2026-03-24',empresa:'LOG MASTER',canal:'whatsapp'},{data:'2026-03-24',empresa:'UNICA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-24',empresa:'GRUPO DTRANS',canal:'whatsapp'},{data:'2026-03-24',empresa:'TRANSPORTADORA CLASSE A',canal:'whatsapp'},
  // ── 25/mar ──
  {data:'2026-03-25',empresa:'PRV TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'LOG MASTER TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'AGS LOG',canal:'ligacao'},{data:'2026-03-25',empresa:'CONCENTO TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'BMG VICENZI TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'TRANSPORTE RICARDO ROSA',canal:'ligacao'},{data:'2026-03-25',empresa:'W&E TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'TRANSPORTADORA CLASSE A',canal:'ligacao'},{data:'2026-03-25',empresa:'ARROW LOGISTICA',canal:'ligacao'},{data:'2026-03-25',empresa:'D.E.S TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'DEC LOG TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'RTT LOG',canal:'ligacao'},{data:'2026-03-25',empresa:'SUPERIOR TRANSPORTES',canal:'ligacao'},{data:'2026-03-25',empresa:'ENI TRANSPORTES',canal:'ligacao'},
  {data:'2026-03-25',empresa:'AGS LOG',canal:'email'},{data:'2026-03-25',empresa:'CONCENTO TRANSPORTES',canal:'email'},{data:'2026-03-25',empresa:'BMG VICENZI TRANSPORTES',canal:'email'},{data:'2026-03-25',empresa:'TRANSPORTE RICARDO ROSA',canal:'email'},{data:'2026-03-25',empresa:'TSF TRANSPORTADORA SANTA FE',canal:'email'},{data:'2026-03-25',empresa:'DEC LOG TRANSPORTES',canal:'email'},{data:'2026-03-25',empresa:'SUPERIOR TRANSPORTES',canal:'email'},
  {data:'2026-03-25',empresa:'PRV TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'PETRA LOG',canal:'whatsapp'},{data:'2026-03-25',empresa:'TRANSPORTADORA IPE AMARELO',canal:'whatsapp'},{data:'2026-03-25',empresa:'AGS LOG',canal:'whatsapp'},{data:'2026-03-25',empresa:'CONCENTO TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'BMG VICENZI TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'TRANSPORTE RICARDO ROSA',canal:'whatsapp'},{data:'2026-03-25',empresa:'TSF TRANSPORTADORA SANTA FE',canal:'whatsapp'},{data:'2026-03-25',empresa:'W&E TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'ROMA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'TWF LOGISTICA',canal:'whatsapp'},{data:'2026-03-25',empresa:'GABRI CARGO',canal:'whatsapp'},{data:'2026-03-25',empresa:'ARROW LOGISTICA',canal:'whatsapp'},{data:'2026-03-25',empresa:'D.E.S TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'DEC LOG TRANSPORTES',canal:'whatsapp'},{data:'2026-03-25',empresa:'RTT LOG',canal:'whatsapp'},{data:'2026-03-25',empresa:'DINIZ SARAIVA',canal:'whatsapp'},{data:'2026-03-25',empresa:'FENIX WAY',canal:'whatsapp'},
  // ── 26/mar ──
  {data:'2026-03-26',empresa:'PRV TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'PETRA LOG',canal:'ligacao'},{data:'2026-03-26',empresa:'PARCEIRO DO GRAO LOGISTICA',canal:'ligacao'},{data:'2026-03-26',empresa:'TRANSPORTADORA IPE AMARELO',canal:'ligacao'},{data:'2026-03-26',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'ligacao'},{data:'2026-03-26',empresa:'AGS LOG',canal:'ligacao'},{data:'2026-03-26',empresa:'CONCENTO TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'BMG VICENZI TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'TRANSPORTE RICARDO ROSA',canal:'ligacao'},{data:'2026-03-26',empresa:'TSF SANTA FE',canal:'ligacao'},{data:'2026-03-26',empresa:'W&E TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'SLC TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'ROMA TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'TRANSPORTADORA ASA SUL',canal:'ligacao'},{data:'2026-03-26',empresa:'TWF LOGISTICA',canal:'ligacao'},{data:'2026-03-26',empresa:'GABRI CARGO',canal:'ligacao'},{data:'2026-03-26',empresa:'D.E.S TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'TRANSCOURIER',canal:'ligacao'},{data:'2026-03-26',empresa:'SIGA BRASIL',canal:'ligacao'},{data:'2026-03-26',empresa:'DIAMANTE',canal:'ligacao'},{data:'2026-03-26',empresa:'FELLON TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'SGR LOGISTICA',canal:'ligacao'},{data:'2026-03-26',empresa:'FENIX WAY',canal:'ligacao'},{data:'2026-03-26',empresa:'3 W TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'UNICA TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'ALO TRANSPORTES',canal:'ligacao'},{data:'2026-03-26',empresa:'VELOZ CARGAS',canal:'ligacao'},{data:'2026-03-26',empresa:'SGR LOGISTICA',canal:'ligacao'},{data:'2026-03-26',empresa:'J&P TRANSPORTADORA',canal:'ligacao'},
  {data:'2026-03-26',empresa:'FENIX WAY',canal:'email'},
  {data:'2026-03-26',empresa:'ALO TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'FENIX WAY',canal:'whatsapp'},{data:'2026-03-26',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'whatsapp'},{data:'2026-03-26',empresa:'3 W TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'SIGA BRASIL',canal:'whatsapp'},{data:'2026-03-26',empresa:'SLC TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'ENI TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'ARROW LOGISTICA',canal:'whatsapp'},{data:'2026-03-26',empresa:'DEC LOG',canal:'whatsapp'},{data:'2026-03-26',empresa:'DIAMANTE',canal:'whatsapp'},{data:'2026-03-26',empresa:'PETRA LOG',canal:'whatsapp'},{data:'2026-03-26',empresa:'TRANSPORTADORA IPE AMARELO',canal:'whatsapp'},{data:'2026-03-26',empresa:'AGS LOG',canal:'whatsapp'},{data:'2026-03-26',empresa:'CONCENTO TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'HOLIVER TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'BMG VICENZI TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'TRANSPORTE RICARDO ROSA',canal:'whatsapp'},{data:'2026-03-26',empresa:'TSF SANTA FE',canal:'whatsapp'},{data:'2026-03-26',empresa:'W&E TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'ROMA TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'TWF LOGISTICA',canal:'whatsapp'},{data:'2026-03-26',empresa:'GABRI CARGO',canal:'whatsapp'},{data:'2026-03-26',empresa:'LAGE LOG',canal:'whatsapp'},{data:'2026-03-26',empresa:'MILLENNIUM',canal:'whatsapp'},{data:'2026-03-26',empresa:'FELLON TRANSPORTES',canal:'whatsapp'},{data:'2026-03-26',empresa:'TRANSPORTADORA ASA SUL',canal:'whatsapp'},{data:'2026-03-26',empresa:'DEC LOG TRANSPORTES',canal:'whatsapp'},
  // ── 27/mar ──
  {data:'2026-03-27',empresa:'SLC TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'SLC TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'AGS LOG',canal:'ligacao'},{data:'2026-03-27',empresa:'PARCEIRO DO GRAO LOGISTICA',canal:'ligacao'},{data:'2026-03-27',empresa:'CONCENTO TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'BMG VICENZI TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'TRANSPORTE RICARDO ROSA',canal:'ligacao'},{data:'2026-03-27',empresa:'FELLON TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'TRANSPORTADORA ASA SUL',canal:'ligacao'},{data:'2026-03-27',empresa:'DEC LOG TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'LAGE LOG',canal:'ligacao'},{data:'2026-03-27',empresa:'FENIX WAY',canal:'ligacao'},{data:'2026-03-27',empresa:'TRANSPORTADORA MINAS BRASIL',canal:'ligacao'},{data:'2026-03-27',empresa:'3 W TRANSPORTES',canal:'ligacao'},{data:'2026-03-27',empresa:'SIGA BRASIL',canal:'ligacao'},
  {data:'2026-03-27',empresa:'UNICA TRANSPORTES',canal:'email'},{data:'2026-03-27',empresa:'AGS LOG',canal:'email'},
  {data:'2026-03-27',empresa:'TRANSCOURIER',canal:'whatsapp'},{data:'2026-03-27',empresa:'AGS LOG',canal:'whatsapp'},{data:'2026-03-27',empresa:'CONCENTO TRANSPORTES',canal:'whatsapp'},{data:'2026-03-27',empresa:'BMG VICENZI TRANSPORTES',canal:'whatsapp'},{data:'2026-03-27',empresa:'TRANSPORTE RICARDO ROSA',canal:'whatsapp'},{data:'2026-03-27',empresa:'FELLON TRANSPORTES',canal:'whatsapp'},{data:'2026-03-27',empresa:'DEC LOG TRANSPORTES',canal:'whatsapp'},{data:'2026-03-27',empresa:'ARROW LOGISTICA',canal:'whatsapp'},{data:'2026-03-27',empresa:'MILLENNIUM TRANSPORTES',canal:'whatsapp'},
];

const EFETIVAS=['ARROW LOGISTICA','DINIZ SARAIVA','GRUPO DTRANS'];

const DIAG_DATA=[
  {id:1,empresa:"DAMACEL TRANSPORTES",status:"COMPLETE",executivo:"Matheus Cambui",estado:"RS",reforma:"Nao",dias:null,tam:"Enterprise",dataInicio:null,dataConclusao:null},
  {id:2,empresa:"S E TRANSPORTES",status:"COMPLETE",executivo:"",estado:"GO",reforma:"Sim",dias:null,tam:"Enterprise",dataInicio:null,dataConclusao:null},
  {id:3,empresa:"RODOCELL TRANSPORTES",status:"COMPLETE",executivo:"Matheus Cambui",estado:"RS",reforma:"Sim",dias:null,tam:"Enterprise",dataInicio:null,dataConclusao:null},
  {id:4,empresa:"GOVEIA RODRIGUES TRANSPORTES",status:"COMPLETE",executivo:"Matheus Cambui",estado:"SP",reforma:"Nao",dias:30,tam:"PME",dataInicio:"2026-02-04",dataConclusao:"2026-03-06"},
  {id:5,empresa:"GRUPO RODOXISTO",status:"COMPLETE",executivo:"Matheus Cambui",estado:"PR",reforma:"Sim",dias:30,tam:"Enterprise",dataInicio:"2026-02-25",dataConclusao:"2026-03-27"},
  {id:6,empresa:"RODOLIVIA",status:"COMPLETE",executivo:"Matheus Cambui",estado:"MT",reforma:"Sim",dias:25,tam:"Enterprise",dataInicio:"2025-12-11",dataConclusao:"2026-01-05"},
  {id:7,empresa:"JORGINHO TRANSPORTES",status:"COMPLETE",executivo:"",estado:"RS",reforma:"Sim",dias:38,tam:"Enterprise",dataInicio:"2025-12-22",dataConclusao:"2026-01-29"},
  {id:8,empresa:"CENTRAL DE TRANSPORTES E SERVICOS",status:"COMPLETE",executivo:"",estado:"SE",reforma:"Sim",dias:15,tam:"Enterprise",dataInicio:"2026-01-28",dataConclusao:"2026-02-12"},
  {id:9,empresa:"JULITAGO BIOENERGIA",status:"COMPLETE",executivo:"",estado:"PR",reforma:"Sim",dias:null,tam:"Enterprise",dataInicio:null,dataConclusao:null},
  {id:10,empresa:"VITILOG",status:"REVALIDACAO",executivo:"",estado:"",reforma:"Nao",dias:null,tam:"Enterprise",dataInicio:"2025-12-15",dataConclusao:"2026-01-12"},
  {id:11,empresa:"STEFANI TRANSPORTES",status:"REVALIDACAO",executivo:"Matheus Cambui",estado:"",reforma:"Sim",dias:null,tam:"Enterprise",dataInicio:"2025-12-18",dataConclusao:"2026-01-16"},
  {id:12,empresa:"DEXLOG",status:"APRESENTACAO",executivo:"",estado:"PR",reforma:"Sim",dias:null,tam:"PME",dataInicio:"2026-01-22",dataConclusao:"2026-02-23"},
  {id:13,empresa:"TRANSPORTADORA HAMMES",status:"EM PROCESSO",executivo:"Matheus Cambui",estado:"RS",reforma:"Sim",dias:null,tam:"Enterprise",dataInicio:"2026-02-11",dataConclusao:"2026-03-13"},
  {id:14,empresa:"JS LOGISTICA",status:"EM PROCESSO",executivo:"Luana/Matheus/Vivian",estado:"MG",reforma:"Sim",dias:null,tam:"PME",dataInicio:"2026-02-25",dataConclusao:"2026-03-27"},
  {id:15,empresa:"EXCELLENCE TRANSPORTES",status:"AGUARDANDO DOCUMENTACAO",executivo:"",estado:"PR",reforma:"Nao",dias:null,tam:"Enterprise",dataInicio:null,dataConclusao:null},
  {id:16,empresa:"MODO AGROLOGISTICA",status:"DESCARTADA",executivo:"",estado:"PR",reforma:"Nao",dias:null,tam:"PME",dataInicio:null,dataConclusao:null},
  {id:17,empresa:"TRANSPORTES BRASIL",status:"EM PROCESSO",executivo:"Luana Alves Fontana",estado:"PR",reforma:"Nao",dias:null,tam:"PME",dataInicio:null,dataConclusao:"2026-04-20"},
  {id:18,empresa:"PONTAL LOGISTICA",status:"NAO INICIADA",executivo:"Luana Alves Fontana",estado:"GO",reforma:"Sim",dias:null,tam:"PME",dataInicio:null,dataConclusao:null},
  {id:19,empresa:"RT RANGEL",status:"NAO INICIADA",executivo:"Luana/Vivian",estado:"RJ",reforma:"Sim",dias:null,tam:"PME",dataInicio:"2026-02-19",dataConclusao:"2026-03-27"},
];

const DIAG_STATUS={"COMPLETE":{dot:"#2D9E60",color:"#2D9E60",label:"Concluido"},"AGUARDANDO DOCUMENTACAO":{dot:"#888",color:"#888",label:"Aguardando Documento"},"EM PROCESSO":{dot:C.orange,color:C.orange,label:"Em Processo"},"REVALIDACAO":{dot:"#B35B00",color:"#B35B00",label:"Revalidacao"},"APRESENTACAO":{dot:"#CC6C00",color:"#CC6C00",label:"Apresentacao"},"NAO INICIADA":{dot:"#4A4B4D",color:"#4A4B4D",label:"Nao Iniciada"},"DESCARTADA":{dot:"#C62828",color:"#C62828",label:"Descartada"}};
const FUNNEL_PHASES=[{key:"NAO INICIADA",label:"Nao Iniciada",bg:"#4A4B4D"},{key:"AGUARDANDO DOCUMENTACAO",label:"Aguardando Documento",bg:"#888"},{key:"EM PROCESSO",label:"Em Processo",bg:C.orange},{key:"REVALIDACAO",label:"Revalidacao",bg:"#B35B00"},{key:"APRESENTACAO",label:"Apresentacao",bg:"#CC6C00"},{key:"COMPLETE",label:"Concluido",bg:"#2D9E60"},{key:"DESCARTADA",label:"Descartada",bg:"#C62828"}];

const ALL_DAYS_MAR=['2026-03-02','2026-03-03','2026-03-04','2026-03-05','2026-03-06','2026-03-07','2026-03-09','2026-03-10','2026-03-11','2026-03-12','2026-03-13','2026-03-16','2026-03-17','2026-03-18','2026-03-19','2026-03-20','2026-03-22','2026-03-23','2026-03-24','2026-03-25','2026-03-26','2026-03-27'];
const MOV_CARLA=[8,0,4,0,0,4,0,13,13,14,0,0,14,17,0,0,15,14,15,16,15,11];
const MOV_SANDRO=[2,8,0,0,0,0,0,7,0,1,1,3,7,8,1,6,0,20,8,3,5,1];
const MOV_MARCO=[0,0,0,0,0,0,0,0,0,0,0,4,6,0,5,0,0,6,5,16,5,6];
const MOV_ISAAC=[0,0,0,0,0,0,0,0,0,0,0,3,9,3,5,0,0,3,9,12,11,2];
const SANDRO_REUNIOES=['2026-03-02','2026-03-04','2026-03-09','2026-03-13','2026-03-17','2026-03-18','2026-03-26'];
const SANDRO_VISITAS=['2026-03-11','2026-03-13'];
const CARLA_REUNIOES=['2026-03-05','2026-03-16','2026-03-18'];
const CARLA_VISITAS=['2026-03-04','2026-03-07','2026-03-07','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-09','2026-03-18','2026-03-18','2026-03-19'];
const MARCO_REUNIOES=['2026-03-19','2026-03-24','2026-03-25','2026-03-27'];
const MARCO_VISITAS=['2026-03-19'];
const ISAAC_REUNIOES=[];
const ISAAC_VISITAS=['2026-03-19','2026-03-19','2026-03-19','2026-03-19','2026-03-19','2026-03-20','2026-03-20','2026-03-23','2026-03-24','2026-03-24','2026-03-25','2026-03-26'];

function buildEvolution(dates,allDays){const counts={};dates.forEach(d=>{counts[d]=(counts[d]||0)+1;});let acc=0;return allDays.map(day=>{acc+=(counts[day]||0);return acc;});}
function buildMovEvolution(movArr){let acc=0;return ALL_DAYS_MAR.map((_,i)=>{acc+=(movArr[i]||0);return acc;});}

const Tip=({active,payload,label})=>{if(!active||!payload||!payload.length)return null;return(<div style={{background:C.dark,color:'#fff',padding:'10px 14px',borderRadius:6,fontSize:12,fontFamily:FONT,boxShadow:'0 8px 24px rgba(0,0,0,0.35)',border:'1px solid #333',minWidth:120}}><div style={{fontWeight:700,marginBottom:5,color:'#AAA',fontSize:10,textTransform:'uppercase'}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:2}}><div style={{width:8,height:8,borderRadius:2,background:p.fill||p.color||C.orange,flexShrink:0}}/><span style={{color:'#CCC',fontSize:11}}>{p.name}:</span><strong style={{color:'white'}}>{typeof p.value==='number'?p.value.toLocaleString('pt-BR'):p.value}</strong></div>))}</div>);};
function Badge({label,color=C.orange,bg}){return(<span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3,background:bg||color+'18',color,display:'inline-block',lineHeight:1.7,whiteSpace:'nowrap',fontFamily:FONT}}>{label}</span>);}
function KPICard({title,value,note,icon}){return(<div style={{background:C.white,borderRadius:8,padding:'16px 18px',border:`2px solid ${C.orange}`,boxShadow:C.shadow,flex:1,minWidth:0,fontFamily:FONT,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}><div style={{fontSize:10,color:C.gray,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{icon&&<span style={{fontSize:13}}>{icon}</span>}{title}</div><div style={{fontSize:28,fontWeight:800,color:C.orange,lineHeight:1.1}}>{typeof value==='number'?value.toLocaleString('pt-BR'):value}</div>{note&&<div style={{fontSize:11,color:C.gray,marginTop:4}}>{note}</div>}</div>);}
function Card({title,children,style:s={},action}){return(<div style={{background:C.white,borderRadius:8,padding:'14px 16px',boxShadow:C.shadow,overflow:'hidden',fontFamily:FONT,...s}}>{(title||action)&&(<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8}}><div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}><div style={{width:3,height:16,background:C.orange,borderRadius:2,flexShrink:0}}/><span style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</span></div>{action&&<div style={{flexShrink:0}}>{action}</div>}</div>)}{children}</div>);}
function PBar({label,actual,meta,color=C.orange}){const p=meta>0?Math.min(actual/meta*100,100):0,over=actual>=meta;return(<div style={{marginBottom:10,fontFamily:FONT}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,fontWeight:600,color:C.text}}>{label}</span><span style={{fontSize:11,color:C.gray}}><strong style={{color:over?C.green:C.text}}>{actual}</strong>/{meta}{over&&<span style={{color:C.green,marginLeft:3,fontWeight:700}}>v</span>}</span></div><div style={{height:7,background:C.grayL,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:over?C.green:color,borderRadius:4}}/></div></div>);}
function TblHead({cols}){return(<thead><tr style={{background:C.grayL,borderBottom:`1.5px solid ${C.border}`}}>{cols.map(h=>(<th key={h} style={{padding:'7px 10px',textAlign:'left',fontSize:9.5,fontWeight:700,color:C.gray,textTransform:'uppercase',whiteSpace:'nowrap',fontFamily:FONT}}>{h}</th>))}</tr></thead>);}
const tRow=i=>({borderBottom:`1px solid ${C.border}`,background:i%2===0?C.white:C.grayL});
function fmtDt(iso){if(!iso)return "—";const p=iso.split("-");return p[2]+"/"+p[1];}
function calcAging(ini,fim){if(!ini)return null;const f=fim?new Date(fim):new Date();return Math.floor((f-new Date(ini))/864e5);}

function ParceriasPage(){
  const[selParceiro,setSelParceiro]=useState('Todos');
  const[selStatus,setSelStatus]=useState('Todos');
  const parceiros=useMemo(()=>['Todos',...[...new Set(PARCERIAS_RAW.map(r=>r[P.PARCEIRO]))].sort()],[]);
  const FL=useMemo(()=>PARCERIAS_RAW.filter(r=>{if(selParceiro!=='Todos'&&r[P.PARCEIRO]!==selParceiro)return false;if(selStatus!=='Todos'&&r[P.STATUS]!==selStatus)return false;return true;}),[selParceiro,selStatus]);
  const perdidos=FL.filter(r=>r[P.STATUS]==='Perdida').length,ativos=FL.filter(r=>r[P.STATUS]==='Em Andamento').length,total=ativos,comReuniao=FL.filter(r=>r[P.STATUS]==='Em Andamento'&&r[P.REUNIAO]==='Sim').length;
  const porParceiro=useMemo(()=>{const m={};PARCERIAS_RAW.forEach(r=>{const p=r[P.PARCEIRO];if(!m[p])m[p]={parceiro:p,total:0,ativos:0,perdidos:0,reunioes:0};m[p].total++;if(r[P.STATUS]==='Em Andamento')m[p].ativos++;if(r[P.STATUS]==='Perdida')m[p].perdidos++;if(r[P.REUNIAO]==='Sim')m[p].reunioes++;});return Object.values(m).sort((a,b)=>b.total-a.total);},[]);
  const porMes=useMemo(()=>{const m={};FL.forEach(r=>{if(!r[P.DATA_IND])return;const parts=r[P.DATA_IND].split('/');if(parts.length<3)return;if(parts[2]!=='2026')return;const key=`${parts[2]}-${parts[1].padStart(2,'0')}`;if(!m[key])m[key]={label:`${parts[1].padStart(2,'0')}/${parts[2].slice(2)}`,key,leads:0,reunioes:0};m[key].leads++;if(r[P.REUNIAO]==='Sim')m[key].reunioes++;});return Object.values(m).sort((a,b)=>a.key.localeCompare(b.key));},[FL]);
  const leadsPorMes2026=useMemo(()=>{const m={};PARCERIAS_RAW.forEach(r=>{if(!r[P.DATA_IND])return;const parts=r[P.DATA_IND].split('/');if(parts.length<3||parts[2]!=='2026')return;const key=`${parts[2]}-${parts[1].padStart(2,'0')}`;const label=`${parts[1].padStart(2,'0')}/${parts[2].slice(2)}`;if(!m[key])m[key]={label,key,leads:0};m[key].leads++;});return Object.values(m).sort((a,b)=>a.key.localeCompare(b.key));},[]);
  const totalLeads2026=leadsPorMes2026.reduce((a,b)=>a+b.leads,0);
  const porEtapa=useMemo(()=>{const m={};FL.forEach(r=>{if(r[P.STATUS]==='Perdida')return;if(r[P.ETAPA])m[r[P.ETAPA]]=(m[r[P.ETAPA]]||0)+1;});return ETAPA_ORDER.filter(e=>m[e]).map(e=>({etapa:e,count:m[e]}));},[FL]);
  const slBtn=(active,color=C.orange)=>({padding:'4px 11px',borderRadius:20,border:`1.5px solid ${active?color:C.border}`,background:active?color:C.white,color:active?C.white:C.gray,fontSize:11,fontWeight:600,cursor:'pointer',flexShrink:0,fontFamily:FONT});
  return(<div style={{display:'flex',flexDirection:'column',gap:11}}>
    <div style={{background:C.white,borderRadius:8,padding:'12px 16px',boxShadow:C.shadow}}>
      <div style={{display:'flex',flexDirection:'column',gap:9}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase',letterSpacing:'0.07em',minWidth:72}}>Parceiro</span><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{parceiros.map(p=>(<button key={p} onClick={()=>setSelParceiro(p)} style={slBtn(selParceiro===p,PARTNER_COLORS[p]||C.orange)}>{p}</button>))}</div></div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase',letterSpacing:'0.07em',minWidth:72}}>Status</span>{['Todos','Em Andamento','Perdida'].map(s=>(<button key={s} onClick={()=>setSelStatus(s)} style={slBtn(selStatus===s,s==='Perdida'?'#4A4B4D':C.orange)}>{s}</button>))}</div>
      </div>
    </div>
    <div style={{display:'flex',gap:9}}>
      <KPICard title="Leads via Parceiros" value={total} icon="🤝" note={`${perdidos} perdidos nao contabilizados`}/>
      <KPICard title="Com Reuniao" value={comReuniao} icon="📅" note={`${pctN(comReuniao,total).toFixed(0)}% dos ativos`}/>
      <KPICard title="Ativos" value={ativos} icon="✅" note={`${FL.length} leads no total`}/>
      <KPICard title="Leads Entrados em 2026" value={totalLeads2026} icon="📈" note={`${leadsPorMes2026.length} meses com indicacoes`}/>
    </div>
    <Card title="Leads Entrados por Mes — 2026">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={leadsPorMes2026} margin={{top:20,right:20,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grayL}/>
          <XAxis dataKey="label" tick={{fontSize:11,fill:C.gray,fontFamily:FONT}}/>
          <YAxis tick={{fontSize:11,fill:C.gray,fontFamily:FONT}} allowDecimals={false}/>
          <Tooltip content={<Tip/>}/>
          <Bar dataKey="leads" name="Leads Entrados" fill={C.orange} radius={[4,4,0,0]} barSize={42}>
            <LabelList dataKey="leads" position="top" style={{fontSize:11,fill:C.orange,fontWeight:600}} formatter={v=>v>0?v:''}/>
          </Bar>
          <Line dataKey="leads" name="Tendencia" stroke={"#8C5200"} strokeWidth={1.5} strokeDasharray="4 3" type="monotone" dot={{r:4,fill:"#8C5200",stroke:'#fff',strokeWidth:2}}/>
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
      <Card title="Ranking de Parceiros">
        <div style={{overflowX:'auto',borderRadius:6,border:`1px solid ${C.border}`}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <TblHead cols={['Parceiro','Total','Ativos','Perdidos','Reunioes','Tx. Perda']}/>
            <tbody>{porParceiro.map((r,i)=>{const txP=r.total>0?Math.round(r.perdidos/r.total*100):0;const color=PARTNER_COLORS[r.parceiro]||C.gray;return(<tr key={i} style={{...tRow(i),cursor:'pointer'}} onClick={()=>setSelParceiro(r.parceiro===selParceiro?'Todos':r.parceiro)}><td style={{padding:'7px 10px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><div style={{width:10,height:10,borderRadius:3,background:color,flexShrink:0}}/><span style={{fontWeight:600}}>{r.parceiro}</span></div></td><td style={{padding:'7px 10px',fontWeight:600,fontSize:13,color}}>{r.total}</td><td style={{padding:'7px 10px',color:C.orange,fontWeight:700}}>{r.ativos}</td><td style={{padding:'7px 10px',color:r.perdidos>0?"#4A4B4D":C.gray,fontWeight:700}}>{r.perdidos||'—'}</td><td style={{padding:'7px 10px',color:"#8C5200",fontWeight:700}}>{r.reunioes||'—'}</td><td style={{padding:'7px 10px'}}><Badge label={`${txP}%`} color={txP>40?"#4A4B4D":txP>20?"#8C5200":C.orange} bg={txP>40?"#EBEBEB":txP>20?"#FFF0D6":C.oL}/></td></tr>);})}</tbody>
          </table>
        </div>
      </Card>
      <Card title="Volume por Parceiro — Ativos vs Perdidos">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={porParceiro} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} horizontal={false}/><XAxis type="number" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}}/><YAxis dataKey="parceiro" type="category" tick={{fontSize:9,fill:C.gray,fontFamily:FONT}} width={115}/><Tooltip content={<Tip/>}/><Legend wrapperStyle={{fontSize:10,fontFamily:FONT}}/>
            <Bar dataKey="ativos" name="Ativos" stackId="a" fill={C.orange} radius={[0,0,0,0]}><LabelList dataKey="ativos" position="insideLeft" style={{fontSize:9,fill:'white',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
            <Bar dataKey="perdidos" name="Perdidos" stackId="a" fill={"#4A4B4D"} radius={[0,4,4,0]}><LabelList dataKey="perdidos" position="right" style={{fontSize:9,fill:"#4A4B4D",fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:11}}>
      <Card title="Indicacoes por Mes — Leads e Reunioes">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={porMes}><CartesianGrid strokeDasharray="3 3" stroke={C.grayL}/><XAxis dataKey="label" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}}/><YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}}/><Tooltip content={<Tip/>}/>
            <Bar dataKey="leads" name="Leads" fill={C.orange} radius={[4,4,0,0]}><LabelList dataKey="leads" position="top" style={{fontSize:9.5,fill:C.orange,fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
            <Bar dataKey="reunioes" name="Reunioes" fill={"#8C5200"} radius={[4,4,0,0]}><LabelList dataKey="reunioes" position="top" style={{fontSize:9.5,fill:"#8C5200",fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Etapas do Funil — Parcerias">
        {porEtapa.map((e,i)=>{const bw=porEtapa[0]?.count>0?pctN(e.count,porEtapa[0].count):0;return(<div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}><div style={{width:130,fontSize:10,color:C.text,textAlign:'right',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.etapa}</div><div style={{flex:1,height:14,background:C.grayL,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${bw}%`,background:i===0?C.orange:i<3?"#8C5200":"#4A4B4D",opacity:Math.max(0.35,1-i*0.06),borderRadius:3}}/></div><span style={{fontSize:10,fontWeight:700,color:C.text,width:28,textAlign:'right',flexShrink:0}}>{e.count}</span></div>);})}
      </Card>
    </div>
    <Card title={`Leads via Parceiros — ${FL.length} registros`}>
      <div style={{overflowX:'auto',borderRadius:6,border:`1px solid ${C.border}`}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,tableLayout:'fixed'}}>
          <colgroup><col style={{width:'20%'}}/><col style={{width:'15%'}}/><col style={{width:'12%'}}/><col style={{width:'14%'}}/><col style={{width:'8%'}}/><col style={{width:'8%'}}/><col style={{width:'11%'}}/><col style={{width:'12%'}}/></colgroup>
          <TblHead cols={['Empresa','Parceiro','Status','Etapa','Reuniao','Decisor','Frota','Responsavel']}/>
          <tbody>{FL.map((r,i)=>{const color=PARTNER_COLORS[r[P.PARCEIRO]]||C.gray;return(<tr key={i} style={tRow(i)}><td style={{padding:'6px 8px',fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r[P.EMPRESA]}</td><td style={{padding:'6px 8px'}}><div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,borderRadius:2,background:color,flexShrink:0}}/><span style={{fontSize:10.5}}>{r[P.PARCEIRO]}</span></div></td><td style={{padding:'6px 8px'}}><Badge label={r[P.STATUS]} color={r[P.STATUS]==='Em Andamento'?C.orange:"#4A4B4D"} bg={r[P.STATUS]==='Em Andamento'?C.oL:"#EBEBEB"}/></td><td style={{padding:'6px 8px'}}><Badge label={r[P.ETAPA]} color={C.orange}/></td><td style={{padding:'6px 8px',textAlign:'center'}}>{r[P.REUNIAO]==='Sim'?<span style={{color:C.orange,fontWeight:700}}>✓</span>:<span style={{color:'#CCC'}}>—</span>}</td><td style={{padding:'6px 8px',textAlign:'center'}}>{r[P.DECISOR]==='Sim'?<span style={{color:C.orange,fontWeight:700,fontSize:10}}>Sim</span>:<span style={{color:'#CCC'}}>—</span>}</td><td style={{padding:'6px 8px',color:C.gray,fontSize:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r[P.FROTA]||'—'}</td><td style={{padding:'6px 8px',color:C.gray,fontSize:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(r[P.RESP]||'').split(' ')[0]||'—'}</td></tr>);})}</tbody>
        </table>
      </div>
    </Card>
  </div>);
}

function DiagPage(){
  const total=DIAG_DATA.length;
  const concluidos=DIAG_DATA.filter(d=>d.status==="COMPLETE").sort((a,b)=>a.empresa.localeCompare(b.empresa,"pt-BR"));
  const emAndamento=DIAG_DATA.filter(d=>d.status!=="COMPLETE").sort((a,b)=>a.empresa.localeCompare(b.empresa,"pt-BR"));
  const nConc=concluidos.length,nAtivo=emAndamento.length;
  const diasArr=DIAG_DATA.filter(d=>d.dias!=null).map(d=>d.dias);
  const diasM=diasArr.length>0?Math.round(diasArr.reduce((a,b)=>a+b,0)/diasArr.length):0;
  const nSim=DIAG_DATA.filter(d=>d.reforma==="Sim").length,nNao=DIAG_DATA.filter(d=>d.reforma==="Nao").length;
  const nSimConc=concluidos.filter(d=>d.reforma==="Sim").length,nSimAtivo=emAndamento.filter(d=>d.reforma==="Sim").length;
  const nEnt=DIAG_DATA.filter(d=>d.tam==="Enterprise").length,nPME=DIAG_DATA.filter(d=>d.tam==="PME").length;
  const pctConc=Math.round(nConc/total*100);
  const bs=`1px solid ${C.border}`;
  const TH={padding:'6px 10px',background:'#F5F5F3',fontSize:10,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'0.05em',borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap',textAlign:'left'};
  const THC={...TH,textAlign:'center'};
  const calcAg=(ini,fim)=>{if(!ini)return null;const f=fim?new Date(fim):new Date();return Math.floor((f-new Date(ini))/864e5);};
  const AgBadge=({d})=>{if(d===null)return <span style={{color:'#CCC'}}>—</span>;const col=d<=15?C.green:d<=30?C.orange:"#B35B00";const bg=d<=15?C.gL:d<=30?C.oL:"#FFF3E0";return <span style={{fontSize:10,fontWeight:700,background:bg,color:col,padding:'2px 7px',borderRadius:10,whiteSpace:'nowrap'}}>{d}d</span>;};
  const StBadge=({status})=>{const s=DIAG_STATUS[status]||{dot:C.gray,color:C.gray,label:status};return(<span style={{fontSize:10.5,color:s.color,fontWeight:600,whiteSpace:'nowrap'}}>{s.label}</span>);};
  const RefBadge=({v})=>{if(!v||v==='—')return <span style={{color:'#CCC'}}>—</span>;return <span style={{fontSize:11,fontWeight:700,color:v==='Sim'?'#2D9E60':C.orange}}>{v}</span>;};
  const UFBadge=({v})=>v?<span style={{fontSize:11,fontWeight:700,color:C.orange}}>{v}</span>:<span style={{color:'#CCC'}}>—</span>;
  const SegBadge=({v})=><span style={{fontSize:10,fontWeight:700,color:v==='Enterprise'?C.orange:'#888',background:v==='Enterprise'?C.oL:'#F0F0F0',padding:'2px 6px',borderRadius:4}}>{v==='Enterprise'?'ETP':'PME'}</span>;
  return(
  <div style={{display:'flex',flexDirection:'column',gap:10,fontFamily:FONT}}>
    <div style={{background:C.white,borderRadius:8,padding:'14px 20px',border:bs,boxShadow:C.shadow}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
        <div><div style={{fontSize:14,fontWeight:600,color:C.text,letterSpacing:'-0.01em'}}>REPORT DE DIAGNÓSTICO</div><div style={{fontSize:11,color:C.gray,marginTop:2}}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</div></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:13,fontWeight:600,color:C.dark,letterSpacing:'-0.02em'}}>RumoBrasil</span><div style={{width:28,height:28,borderRadius:6,background:C.orange,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:13,fontWeight:700,color:'#fff'}}>R</span></div></div>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1.6fr',gap:10}}>
      <div style={{background:C.white,borderRadius:8,padding:'12px 16px',border:bs,boxShadow:C.shadow,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
        <div style={{fontSize:9,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>Pipeline Total</div>
        <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'center'}}>
          <span style={{fontSize:32,fontWeight:600,color:C.text,lineHeight:1}}>{total}</span>
          <div style={{display:'flex',gap:6}}>
            <div style={{background:C.oL,borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontSize:14,fontWeight:600,color:C.orange}}>{nEnt}</div><div style={{fontSize:8,color:C.orange,fontWeight:700,textTransform:'uppercase'}}>ETP</div></div>
            <div style={{background:'#F2F2F0',borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontSize:14,fontWeight:600,color:'#666'}}>{nPME}</div><div style={{fontSize:8,color:'#666',fontWeight:700,textTransform:'uppercase'}}>PME</div></div>
          </div>
        </div>
        <div style={{fontSize:10,color:'#AAA',marginTop:5}}>{pctConc}% concluído</div>
      </div>
      <div style={{background:C.white,borderRadius:8,padding:'12px 16px',border:bs,boxShadow:C.shadow,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{fontSize:9,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Concluídos</div><div style={{fontSize:32,fontWeight:600,color:C.text,lineHeight:1}}>{nConc}</div><div style={{fontSize:10,color:'#AAA',marginTop:4}}>{pctConc}% de conclusão</div></div>
      <div style={{background:C.white,borderRadius:8,padding:'12px 16px',border:bs,boxShadow:C.shadow,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{fontSize:9,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Em Andamento</div><div style={{fontSize:32,fontWeight:600,color:C.text,lineHeight:1}}>{nAtivo}</div><div style={{fontSize:10,color:'#AAA',marginTop:4}}>{nAtivo} empresas ativas</div></div>
      <div style={{background:C.white,borderRadius:8,padding:'12px 16px',border:bs,boxShadow:C.shadow,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{fontSize:9,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>Prazo Médio</div><div style={{fontSize:32,fontWeight:600,color:C.text,lineHeight:1}}>{diasM}d</div><div style={{fontSize:10,color:'#AAA',marginTop:4}}>média para concluir</div></div>
      <div style={{background:C.white,borderRadius:8,padding:'12px 16px',border:bs,boxShadow:C.shadow,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
        <div style={{fontSize:9,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>Reforma Tributária</div>
        <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'center'}}>
          <span style={{fontSize:32,fontWeight:600,color:C.text,lineHeight:1}}>{nSim}</span>
          <div style={{display:'flex',gap:6}}>
            <div style={{background:C.gL,borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontSize:12,fontWeight:600,color:'#2D9E60'}}>{nSimConc}</div><div style={{fontSize:8,color:'#2D9E60',fontWeight:700,textTransform:'uppercase'}}>Conc.</div></div>
            <div style={{background:C.oL,borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontSize:12,fontWeight:600,color:C.orange}}>{nSimAtivo}</div><div style={{fontSize:8,color:C.orange,fontWeight:700,textTransform:'uppercase'}}>Ativos</div></div>
            <div style={{background:'#F2F2F0',borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontSize:12,fontWeight:600,color:'#888'}}>{nNao}</div><div style={{fontSize:8,color:'#888',fontWeight:700,textTransform:'uppercase'}}>Não optam</div></div>
          </div>
        </div>
        <div style={{fontSize:10,color:'#AAA',marginTop:5}}>{Math.round(nSim/total*100)}% optam</div>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:10,alignItems:'stretch'}}>
      <div style={{background:C.white,borderRadius:8,border:bs,boxShadow:C.shadow,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'7px 12px',borderBottom:bs,background:'#F5F5F3',flexShrink:0}}><span style={{fontSize:9,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'0.07em'}}>Pipeline por Fase</span></div>
        <div style={{flex:1,padding:'12px',display:'flex',flexDirection:'column',justifyContent:'space-evenly',gap:4}}>
          {(()=>{const WIDTHS=[100,86,72,60,46,30];return FUNNEL_PHASES.map((f,i)=>{const cnt=DIAG_DATA.filter(d=>d.status===f.key).length;const col=cnt>0?f.bg:'#E8E8E8';const labelCol=cnt>0?f.bg:'#BBBBBB';const w=WIDTHS[i];return(<div key={f.key} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}><span style={{fontSize:11,fontWeight:600,color:labelCol,whiteSpace:'nowrap',lineHeight:1.2,textAlign:'center'}}>{f.label}</span><div style={{width:`${w}%`,height:26,background:col,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:12,fontWeight:600,color:'#fff'}}>{cnt}</span></div></div>);});})()}
        </div>
      </div>
      <div style={{background:C.white,borderRadius:8,border:bs,boxShadow:C.shadow,overflow:'hidden'}}>
        <div style={{padding:'7px 14px',borderBottom:bs,background:'#F5F5F3',display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:9,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'0.07em'}}>Concluídas</span><span style={{background:C.oL,color:C.orange,borderRadius:20,padding:'1px 8px',fontSize:9,fontWeight:700}}>{nConc}</span></div>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}><thead><tr><th style={{...TH,width:'28%'}}>Empresa</th><th style={{...THC,width:'18%'}}>Executivo</th><th style={{...THC,width:'6%'}}>UF</th><th style={{...THC,width:'7%'}}>Seg.</th><th style={{...THC,width:'13%'}}>Dt. Entrada</th><th style={{...THC,width:'13%'}}>Dt. Conclusão</th><th style={{...THC,width:'9%'}}>Reforma</th></tr></thead><tbody>{concluidos.map((d,i)=>(<tr key={d.id} style={{borderBottom:`1px solid #F2F2F0`,background:i%2===0?C.white:'#FAFAF8'}}><td style={{padding:'7px 10px',fontWeight:700,fontSize:11,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:200}}>{d.empresa}</td><td style={{padding:'7px 10px',textAlign:'center',fontSize:11,color:'#666'}}>{d.executivo||'—'}</td><td style={{padding:'7px 10px',textAlign:'center'}}><UFBadge v={d.estado}/></td><td style={{padding:'7px 10px',textAlign:'center'}}><SegBadge v={d.tam}/></td><td style={{padding:'7px 10px',textAlign:'center',fontSize:11,color:'#888'}}>{fmtDt(d.dataInicio)}</td><td style={{padding:'7px 10px',textAlign:'center',fontSize:11,color:'#888'}}>{fmtDt(d.dataConclusao)}</td><td style={{padding:'7px 10px',textAlign:'center'}}><RefBadge v={d.reforma}/></td></tr>))}</tbody></table></div>
      </div>
    </div>
    <div style={{background:C.white,borderRadius:8,border:bs,boxShadow:C.shadow,overflow:'hidden'}}>
      <div style={{padding:'7px 14px',borderBottom:bs,background:'#F5F5F3',display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:9,fontWeight:700,color:'#999',textTransform:'uppercase',letterSpacing:'0.07em'}}>Em Andamento</span><span style={{background:C.oL,color:C.orange,borderRadius:20,padding:'1px 8px',fontSize:9,fontWeight:700}}>{nAtivo}</span></div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}><thead><tr><th style={{...TH,width:'20%'}}>Empresa</th><th style={{...THC,width:'14%'}}>Status</th><th style={{...THC,width:'16%'}}>Executivo(s)</th><th style={{...THC,width:'5%'}}>UF</th><th style={{...THC,width:'6%'}}>Seg.</th><th style={{...THC,width:'10%'}}>Dt. Entrada</th><th style={{...THC,width:'10%'}}>Dt. Conclusão</th><th style={{...THC,width:'7%'}}>Aging</th><th style={{...THC,width:'7%'}}>Reforma</th></tr></thead><tbody>{emAndamento.map((d,i)=>{const ag=calcAg(d.dataInicio,d.dataConclusao);return(<tr key={d.id} style={{borderBottom:`1px solid #F2F2F0`,background:i%2===0?C.white:'#FAFAF8'}}><td style={{padding:'7px 10px',fontWeight:700,fontSize:11,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:220}}>{d.empresa}</td><td style={{padding:'7px 10px',textAlign:'center'}}><StBadge status={d.status}/></td><td style={{padding:'7px 10px',textAlign:'center',fontSize:10.5,color:'#666'}}>{d.executivo||'—'}</td><td style={{padding:'7px 10px',textAlign:'center'}}><UFBadge v={d.estado}/></td><td style={{padding:'7px 10px',textAlign:'center'}}><SegBadge v={d.tam}/></td><td style={{padding:'7px 10px',textAlign:'center',fontSize:11,color:'#888'}}>{fmtDt(d.dataInicio)}</td><td style={{padding:'7px 10px',textAlign:'center',fontSize:11,color:'#888'}}>{fmtDt(d.dataConclusao)}</td><td style={{padding:'7px 10px',textAlign:'center'}}><AgBadge d={ag}/></td><td style={{padding:'7px 10px',textAlign:'center'}}><RefBadge v={d.reforma}/></td></tr>);})}</tbody></table></div>
      <div style={{padding:'7px 14px',borderTop:bs,background:'#F5F5F3',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontSize:8.5,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.06em'}}>Status:</span>
        {FUNNEL_PHASES.filter(f=>f.key!=='NAO INICIADA').map(f=>(<div key={f.key} style={{display:'flex',alignItems:'center',gap:3}}><div style={{width:7,height:7,borderRadius:'50%',background:f.bg}}/><span style={{fontSize:9,color:'#555'}}>{f.label}</span></div>))}
        <span style={{fontSize:8.5,fontWeight:700,color:'#AAA',textTransform:'uppercase',letterSpacing:'0.06em',marginLeft:10}}>Aging:</span>
        {[['≤15d',C.green,C.gL,'Recente'],['16–30d',C.orange,C.oL,'Atenção'],['> 30d','#B35B00','#FFF3E0','Crítico']].map(([v,c,bg,l])=>(<div key={v} style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontSize:9,background:bg,color:c,padding:'1px 6px',borderRadius:8,fontWeight:700}}>{v}</span><span style={{fontSize:9,color:'#555'}}>{l}</span></div>))}
      </div>
    </div>
  </div>);
}

const TATIANE_AGENDAMENTOS=[];
const TATIANE_MOV=[
  {dia:'25/mar',data:'2026-03-25',mov:39},
  {dia:'26/mar',data:'2026-03-26',mov:53},
  {dia:'27/mar',data:'2026-03-27',mov:17},
];
const TATIANE_REUNIOES=[],TATIANE_VISITAS=[],MOV_TATIANE=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,53,30];
// Atividades diárias Tatiane por canal (alinhadas com ALL_DAYS_MAR)
// [02,03,04,05,06,07,09,10,11,12,13,16,17,18,19,20,22,23,24,25,26,27]
const TATIANE_LIG_DIA= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,52,13];
const TATIANE_EML_DIA= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,17];
const TATIANE_WHA_DIA= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0];

function TatianeMixEvolChart(){
  const COL_L=C.orange,COL_E='#444444',COL_W='#AAAAAA';
  const[showLig,setShowLig]=useState(true);
  const[showEml,setShowEml]=useState(true);
  const[showWha,setShowWha]=useState(true);
  const ligAcc=buildSdrEvol(TATIANE_LIG_DIA);
  const emlAcc=buildSdrEvol(TATIANE_EML_DIA);
  const whaAcc=buildSdrEvol(TATIANE_WHA_DIA);
  const totalLig=ligAcc[ligAcc.length-1];
  const totalEml=emlAcc[emlAcc.length-1];
  const totalWha=whaAcc[whaAcc.length-1];
  const totalCanais=totalLig+totalEml+totalWha;
  const evolData=ALL_DAYS_MAR.map((d,i)=>({
    dia:String(parseInt(d.slice(8)))+'/mar',
    ligacao:ligAcc[i],
    email:emlAcc[i],
    whatsapp:whaAcc[i],
  }));
  const canalInfo=[
    {label:'Ligacao',qtd:totalLig,pct:totalCanais>0?Math.round(totalLig/totalCanais*100):0,fill:COL_L,icon:'📞'},
    {label:'E-mail', qtd:totalEml,pct:totalCanais>0?Math.round(totalEml/totalCanais*100):0,fill:COL_E,icon:'✉️'},
    {label:'WhatsApp',qtd:totalWha,pct:totalCanais>0?Math.round(totalWha/totalCanais*100):0,fill:COL_W,icon:'💬'},
  ];
  const tagStyle=(active,col)=>({fontSize:10,fontWeight:600,cursor:'pointer',padding:'2px 8px',borderRadius:10,background:active?col+'18':'#F0F0F0',color:active?col:'#AAA',border:`1.5px solid ${active?col:'#DDD'}`,textDecoration:active?'none':'line-through'});
  const mkDot=(key,col)=>(props)=>{const{cx,cy,index}=props;const val=evolData[index][key];const prev=index>0?evolData[index-1][key]:null;if(val===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={5} fill={col} stroke="#fff" strokeWidth={1.5}/>;};
  const mkLabel=(key,col)=>(props)=>{const{x,y,index}=props;const val=evolData[index][key];const prev=index>0?evolData[index-1][key]:null;if(val===prev&&index>0)return null;return <text key={index} x={x} y={y-10} textAnchor="middle" fill={col} fontSize={10} fontWeight={500} fontFamily={FONT}>{val}</text>;};
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1.8fr',gap:11}}>
      <Card title="Mix de Canais">
        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
          {canalInfo.map(d=>(<div key={d.label}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <span style={{fontSize:12,fontWeight:600}}>{d.icon} {d.label}</span>
              <span><strong style={{color:d.fill,fontSize:13}}>{d.qtd}</strong><span style={{fontSize:11,color:C.gray}}> ({d.pct}%)</span></span>
            </div>
            <div style={{height:12,background:C.grayL,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${d.pct}%`,background:d.fill,borderRadius:6}}/></div>
          </div>))}
        </div>
      </Card>
      <Card title="Evolucao Diaria - Tatiane Gomes">
        <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_L,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_L}}/><span style={{fontSize:10,fontWeight:700,color:COL_L}}>Ligacoes</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_E,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_E}}/><span style={{fontSize:10,fontWeight:700,color:COL_E}}>E-mails</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_W,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_W}}/><span style={{fontSize:10,fontWeight:700,color:COL_W}}>WhatsApp</span></div>
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <span onClick={()=>setShowLig(v=>!v)} style={tagStyle(showLig,COL_L)}>{totalLig} lig.</span>
            <span onClick={()=>setShowEml(v=>!v)} style={tagStyle(showEml,COL_E)}>{totalEml} email</span>
            <span onClick={()=>setShowWha(v=>!v)} style={tagStyle(showWha,COL_W)}>{totalWha} whats</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={evolData} margin={{top:28,right:16,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
            <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,'dataMax+15']}/>
            <Tooltip content={<Tip/>}/>
            {showLig&&<Line dataKey="ligacao" name="Ligacoes" stroke={COL_L} strokeWidth={1.5} type="monotone" dot={mkDot('ligacao',COL_L)} label={mkLabel('ligacao',COL_L)}/>}
            {showEml&&<Line dataKey="email" name="E-mails" stroke={COL_E} strokeWidth={1.5} type="monotone" dot={mkDot('email',COL_E)} label={mkLabel('email',COL_E)}/>}
            {showWha&&<Line dataKey="whatsapp" name="WhatsApp" stroke={COL_W} strokeWidth={1.5} strokeDasharray="5 3" type="monotone" dot={mkDot('whatsapp',COL_W)} label={mkLabel('whatsapp',COL_W)}/>}
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function TatianeAtivChart(){
  const COL_L=C.orange,COL_E='#444444',COL_W='#AAAAAA',COL_AG='#1B5E20';
  const[showLig,setShowLig]=useState(true);
  const[showEml,setShowEml]=useState(true);
  const[showWha,setShowWha]=useState(true);
  const[visMode,setVisMode]=useState('diario');
  const ligAcc=buildSdrEvol(TATIANE_LIG_DIA);
  const emlAcc=buildSdrEvol(TATIANE_EML_DIA);
  const whaAcc=buildSdrEvol(TATIANE_WHA_DIA);
  const tatAgendAcum=ALL_DAYS_MAR.map(()=>0);
  const totalLig=ligAcc[ligAcc.length-1],totalEml=emlAcc[emlAcc.length-1],totalWha=whaAcc[whaAcc.length-1];
  const totalCanais=totalLig+totalEml+totalWha;
  const totalAg=tatAgendAcum[tatAgendAcum.length-1];
  const META_MES=500;
  const pct=Math.min(Math.round(totalCanais/META_MES*100),100);
  const faltam=Math.max(0,META_MES-totalCanais);
  // Dados mensais Tatiane
  const TATIANE_MENSAL=[
    {mes:'Mar/26',key:'2026-03',ligacao:totalLig,email:totalEml,whatsapp:totalWha,agendamentosAcum:0},
  ];
  const diarioData=ALL_DAYS_MAR.map((d,i)=>({
    dia:String(parseInt(d.slice(8)))+'/mar',
    ligacao:TATIANE_LIG_DIA[i]>0?TATIANE_LIG_DIA[i]:0,
    email:TATIANE_EML_DIA[i]>0?TATIANE_EML_DIA[i]:0,
    whatsapp:TATIANE_WHA_DIA[i]>0?TATIANE_WHA_DIA[i]:0,
    agendamentosAcum:tatAgendAcum[i]>0?tatAgendAcum[i]:null,
  }));
  const mensalData=TATIANE_MENSAL.map(m=>({dia:m.mes,ligacao:m.ligacao,email:m.email,whatsapp:m.whatsapp,agendamentosAcum:m.agendamentosAcum||null}));
  const chartData=visMode==='diario'?diarioData:mensalData;
  const maxAgend=visMode==='diario'?Math.max(totalAg+2,5):Math.max(...TATIANE_MENSAL.map(m=>m.agendamentosAcum||0))+2;
  const barSize=visMode==='mensal'?80:40;
  const tagStyle=(active,col)=>({fontSize:10,fontWeight:600,cursor:'pointer',padding:'2px 8px',borderRadius:10,background:active?col+'18':'#F0F0F0',color:active?col:'#AAA',border:`1.5px solid ${active?col:'#DDD'}`,textDecoration:active?'none':'line-through'});
  const btnStyle=(active)=>({padding:'4px 14px',borderRadius:20,border:`1.5px solid ${active?C.orange:C.border}`,background:active?C.orange:C.white,color:active?C.white:C.gray,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:FONT});
  const mkDotAg=(props)=>{const{cx,cy,index,value}=props;if(!value)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;const prev=index>0?chartData[index-1]?.agendamentosAcum:null;if(value===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={6} fill={COL_AG} stroke="#fff" strokeWidth={1.5}/>;};
  const mkLabelAg=(props)=>{const{x,y,index,value}=props;if(!value)return null;const prev=index>0?chartData[index-1]?.agendamentosAcum:null;if(value===prev&&index>0)return null;return <text key={index} x={x} y={y-11} textAnchor="middle" fill={COL_AG} fontSize={11} fontWeight={500} fontFamily={FONT}>{value}</text>;};
  return(
    <Card title="Atividades por Dia — por Canal + Agendamentos Acumulados (Tatiane Gomes)">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_L,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_L}}/><span style={{fontSize:10,fontWeight:700,color:COL_L}}>Ligacoes</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_E,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_E}}/><span style={{fontSize:10,fontWeight:700,color:COL_E}}>E-mails</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_W,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_W}}/><span style={{fontSize:10,fontWeight:700,color:COL_W}}>WhatsApp</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:20,height:2.5,background:COL_AG,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_AG}}/><span style={{fontSize:10,fontWeight:700,color:COL_AG}}>Agend. Acum. (eixo dir.)</span></div>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {visMode==='diario'&&<div style={{display:'flex',gap:6}}>
            <span onClick={()=>setShowLig(v=>!v)} style={tagStyle(showLig,COL_L)}>{totalLig} lig.</span>
            <span onClick={()=>setShowEml(v=>!v)} style={tagStyle(showEml,COL_E)}>{totalEml} email</span>
            <span onClick={()=>setShowWha(v=>!v)} style={tagStyle(showWha,COL_W)}>{totalWha} whats</span>
          </div>}
          <button onClick={()=>setVisMode('diario')} style={btnStyle(visMode==='diario')}>📅 Diário (Mar/26)</button>
          <button onClick={()=>setVisMode('mensal')} style={btnStyle(visMode==='mensal')}>📊 Compilado Mensal</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{top:20,right:45,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
          <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="left" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="right" orientation="right" tick={{fontSize:10,fill:COL_AG,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,maxAgend]}/>
          <Tooltip content={<Tip/>}/>
          <Legend wrapperStyle={{fontSize:10,fontFamily:FONT}}/>
          {visMode==='diario'&&<ReferenceLine yAxisId="left" y={25} stroke={C.orange} strokeWidth={1.5} strokeDasharray="5 3" label={{value:'Meta 25/dia',fill:C.orange,fontSize:9,fontWeight:700,position:'insideTopRight'}}/>}
          {(visMode==='diario'?showLig:true)&&<Bar yAxisId="left" dataKey="ligacao" name="Ligacao" stackId="a" fill={COL_L} barSize={barSize}><LabelList dataKey="ligacao" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>}
          {(visMode==='diario'?showEml:true)&&<Bar yAxisId="left" dataKey="email" name="E-mail" stackId="a" fill={COL_E} barSize={barSize}><LabelList dataKey="email" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>}
          {(visMode==='diario'?showWha:true)&&<Bar yAxisId="left" dataKey="whatsapp" name="WhatsApp" stackId="a" fill={COL_W} radius={[4,4,0,0]} barSize={barSize}><LabelList dataKey="whatsapp" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>}
          <Line yAxisId="right" dataKey="agendamentosAcum" name="Agend. Acumulados" stroke={COL_AG} strokeWidth={1.5} type="monotone" connectNulls={true} dot={mkDotAg} label={mkLabelAg}/>
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
        <div style={{background:C.orange,borderRadius:4,padding:'4px 12px',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:11,fontWeight:700,color:C.white}}>Meta de Ligações Diárias: <strong>25 ligações/dia</strong></span></div>
        <div style={{background:C.orange,borderRadius:4,padding:'4px 12px',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:11,fontWeight:700,color:C.white}}>Meta de Ligações Semanais: <strong>112 ligações/semana</strong></span></div>
      </div>
      <div style={{marginTop:10,padding:'12px 14px',background:C.grayL,borderRadius:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:700,color:C.text}}>Meta Mensal de Contatos (Mar/26)</span>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:600,color:C.orange}}>{totalCanais}</span>
            <span style={{fontSize:11,color:C.gray}}>/ {META_MES}</span>
            <span style={{fontSize:11,fontWeight:700,color:pct>=100?C.green:C.gray}}>{pct}%</span>
          </div>
        </div>
        <div style={{height:10,background:C.border,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:pct>=100?C.green:C.orange,borderRadius:6}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
          <span style={{fontSize:10,color:C.gray}}>125 interacoes/semana - 25/dia</span>
          <span style={{fontSize:10,color:faltam>0?C.red:C.green,fontWeight:600}}>{faltam>0?'Faltam '+faltam+' contatos':'Meta atingida!'}</span>
        </div>
      </div>
    </Card>
  );
}
const EXEC_INTERNOS=[{nome:"Tatiane Gomes",alias:"Tatiane",color:C.orange,metaVisitasAnual:0,metaContratos:0,metaVisitasMar:0}];

function ExecEvolutionChart({nome,reunioes,visitas,movArr,metaMov}){
  const[showReun,setShowReun]=useState(true);
  const[showVis,setShowVis]=useState(true);
  const[showMov,setShowMov]=useState(true);
  const reunAcc=buildEvolution(reunioes,ALL_DAYS_MAR);
  const visAcc=buildEvolution(visitas,ALL_DAYS_MAR);
  const movAcc=buildMovEvolution(movArr);
  const data=ALL_DAYS_MAR.map((d,i)=>({dia:String(parseInt(d.slice(8)))+'/mar',reunioes:reunAcc[i],visitas:visAcc[i],movimentacoes:movAcc[i]}));
  const totalReun=reunAcc[reunAcc.length-1],totalVis=visAcc[visAcc.length-1],totalMov=movAcc[movAcc.length-1];
  const pctMov=metaMov>0?Math.min(Math.round(totalMov/metaMov*100),100):0;
  const faltamMov=Math.max(0,metaMov-totalMov);
  const COL_R=C.orange,COL_V='#444444',COL_M='#AAAAAA';
  const renderDot=(dataKey,col)=>(props)=>{const{cx,cy,index}=props;const val=data[index][dataKey];const prev=index>0?data[index-1][dataKey]:null;if(val===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={5} fill={col} stroke="#fff" strokeWidth={1.5}/>;};
  const renderLabel=(dataKey,col)=>(props)=>{const{x,y,index}=props;const val=data[index][dataKey];const prev=index>0?data[index-1][dataKey]:null;if(val===prev&&index>0)return null;return <text key={index} x={x} y={y-10} textAnchor="middle" fill={col} fontSize={11} fontWeight={500} fontFamily={FONT}>{val}</text>;};
  const tagStyle=(active,col)=>({fontSize:10,fontWeight:600,cursor:'pointer',padding:'2px 8px',borderRadius:10,background:active?col+'18':'#F0F0F0',color:active?col:'#AAA',border:`1.5px solid ${active?col:'#DDD'}`,textDecoration:active?'none':'line-through'});
  return(
    <Card title={"Evolucao Diaria - "+nome}>
      <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_R,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_R}}/><span style={{fontSize:10,fontWeight:700,color:COL_R}}>Reunioes</span></div>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_V,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_V}}/><span style={{fontSize:10,fontWeight:700,color:COL_V}}>Visitas</span></div>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_M,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_M}}/><span style={{fontSize:10,fontWeight:700,color:COL_M}}>Movimentacoes</span></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <span onClick={()=>setShowReun(v=>!v)} style={tagStyle(showReun,COL_R)}>{totalReun} reun.</span>
          <span onClick={()=>setShowVis(v=>!v)} style={tagStyle(showVis,COL_V)}>{totalVis} vis.</span>
          <span onClick={()=>setShowMov(v=>!v)} style={tagStyle(showMov,COL_M)}>{totalMov} movs.</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{top:28,right:40,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
          <XAxis dataKey="dia" tick={{fontSize:9,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="left" tick={{fontSize:9,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,'dataMax+2']}/>
          <YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:COL_M,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,'dataMax+10']}/>
          <Tooltip content={<Tip/>}/>
          {showReun&&<Line yAxisId="left" dataKey="reunioes" name="Reunioes c/ Decisor" stroke={COL_R} strokeWidth={1.5} type="monotone" dot={renderDot('reunioes',COL_R)} label={renderLabel('reunioes',COL_R)}/>}
          {showVis&&<Line yAxisId="left" dataKey="visitas" name="Visitas" stroke={COL_V} strokeWidth={1.5} type="monotone" dot={renderDot('visitas',COL_V)} label={renderLabel('visitas',COL_V)}/>}
          {showMov&&<Line yAxisId="right" dataKey="movimentacoes" name="Movimentacoes" stroke={COL_M} strokeWidth={1.5} strokeDasharray="5 3" type="monotone"
            dot={(props)=>{const{cx,cy,index}=props;const val=data[index].movimentacoes;const prev=index>0?data[index-1].movimentacoes:null;if(val===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={4} fill={COL_M} stroke="#fff" strokeWidth={1.5}/>;}}
            label={(props)=>{const{x,y,index}=props;const val=data[index].movimentacoes;const prev=index>0?data[index-1].movimentacoes:null;if(val===prev&&index>0)return null;return <text key={index} x={x} y={y-9} textAnchor="middle" fill={COL_M} fontSize={10} fontWeight={700} fontFamily={FONT}>{val}</text>;}}
          />}
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{marginTop:12,padding:'10px 12px',background:C.grayL,borderRadius:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:C.text}}>Meta de Movimentacoes (Mar/26)</span><div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:12,fontWeight:600,color:COL_M}}>{totalMov}</span><span style={{fontSize:11,color:C.gray}}>/ {metaMov||'—'}</span><span style={{fontSize:11,fontWeight:700,color:pctMov>=100?C.green:C.gray}}>{metaMov?pctMov+'%':'—'}</span></div></div>
        <div style={{height:8,background:C.border,borderRadius:5,overflow:'hidden'}}><div style={{height:'100%',width:`${pctMov}%`,background:pctMov>=100?C.green:COL_M,borderRadius:5}}/></div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:4}}><span style={{fontSize:10,color:faltamMov>0?C.red:C.green,fontWeight:600}}>{metaMov?(faltamMov>0?'Faltam '+faltamMov+' movimentacoes':'Meta atingida!'):'Meta a definir'}</span></div>
      </div>
    </Card>
  );
}

function SDREvolutionChart(){
  const[showLig,setShowLig]=useState(true);
  const[showEml,setShowEml]=useState(true);
  const[showWha,setShowWha]=useState(true);
  const ligAcc=buildSdrEvol(SDR_LIG_DIA),emlAcc=buildSdrEvol(SDR_EML_DIA),whaAcc=buildSdrEvol(SDR_WHA_DIA);
  const data=SDR_DAYS_LBL.map((dia,i)=>({dia,ligacao:ligAcc[i],email:emlAcc[i],whatsapp:whaAcc[i]}));
  const COL_L=C.orange,COL_E='#444444',COL_W='#AAAAAA';
  const mkDot=(key,col)=>(props)=>{const{cx,cy,index}=props;const val=data[index][key];const prev=index>0?data[index-1][key]:null;if(val===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={5} fill={col} stroke="#fff" strokeWidth={1.5}/>;};
  const mkLabel=(key,col)=>(props)=>{const{x,y,index}=props;const val=data[index][key];const prev=index>0?data[index-1][key]:null;if(val===prev&&index>0)return null;return <text key={index} x={x} y={y-10} textAnchor="middle" fill={col} fontSize={10} fontWeight={500} fontFamily={FONT}>{val}</text>;};
  const tagStyle=(active,col)=>({fontSize:10,fontWeight:600,cursor:'pointer',padding:'2px 8px',borderRadius:10,background:active?col+'18':'#F0F0F0',color:active?col:'#AAA',border:`1.5px solid ${active?col:'#DDD'}`,textDecoration:active?'none':'line-through'});
  return(
    <Card title="Evolucao Diaria - Fabiana Vaz (SDR)">
      <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_L,borderRadius:2}}/><span style={{fontSize:10,fontWeight:700,color:COL_L}}>Ligacoes</span></div>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_E,borderRadius:2}}/><span style={{fontSize:10,fontWeight:700,color:COL_E}}>E-mails</span></div>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_W,borderRadius:2}}/><span style={{fontSize:10,fontWeight:700,color:COL_W}}>WhatsApp</span></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <span onClick={()=>setShowLig(v=>!v)} style={tagStyle(showLig,COL_L)}>{ligAcc[ligAcc.length-1]} lig.</span>
          <span onClick={()=>setShowEml(v=>!v)} style={tagStyle(showEml,COL_E)}>{emlAcc[emlAcc.length-1]} email</span>
          <span onClick={()=>setShowWha(v=>!v)} style={tagStyle(showWha,COL_W)}>{whaAcc[whaAcc.length-1]} whats</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{top:28,right:16,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
          <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,'dataMax+15']}/>
          <Tooltip content={<Tip/>}/>
          {showLig&&<Line dataKey="ligacao" name="Ligacoes" stroke={COL_L} strokeWidth={1.5} type="monotone" dot={mkDot('ligacao',COL_L)} label={mkLabel('ligacao',COL_L)}/>}
          {showEml&&<Line dataKey="email" name="E-mails" stroke={COL_E} strokeWidth={1.5} type="monotone" dot={mkDot('email',COL_E)} label={mkLabel('email',COL_E)}/>}
          {showWha&&<Line dataKey="whatsapp" name="WhatsApp" stroke={COL_W} strokeWidth={1.5} strokeDasharray="5 3" type="monotone" dot={mkDot('whatsapp',COL_W)} label={mkLabel('whatsapp',COL_W)}/>}
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

function AcompPage({FL}){
  const[selMes,setSelMes]=useState('2026-03');
  const[selExec,setSelExec]=useState('Todos');
  const dados=useMemo(()=>selExec==='Todos'?FL:FL.filter(r=>r[F.RESP]===selExec),[FL,selExec]);
  const REUN_MANUAL={'Sandro Casagrande':{'2026-02':9,'2026-03':7},'Carla Cristina Lemes':{'2026-02':2,'2026-03':4},'Marco':{'2026-03':3}};
  const getReunMes=(nome,mes)=>{if(REUN_MANUAL[nome]&&REUN_MANUAL[nome][mes]!==undefined)return REUN_MANUAL[nome][mes];return dados.filter(r=>r[F.RESP]===nome&&r[F.DREUNIAO]&&mo(r[F.DREUNIAO])===mes).length;};
  const execStats=useMemo(()=>EXEC_METAS.map(e=>{
    const mesLimite=selMes||'2026-03';
    const eLeads=dados.filter(r=>r[F.RESP]===e.nome);
    const mesesAte=MONTHS_KEY.filter(k=>k>='2026-01'&&k<=mesLimite);
    const reunYTD=mesesAte.reduce((acc,m)=>acc+getReunMes(e.nome,m),0);
    const faltam=Math.max(0,e.metaVisitasAnual-reunYTD);
    const pctR=e.metaVisitasAnual>0?Math.min(reunYTD/e.metaVisitasAnual*100,100):0;
    const contrYTD=eLeads.filter(r=>r[F.ESTADO]==='Vendida'&&r[F.DFECH]>='2026-01-01'&&(!selMes||mo(r[F.DFECH])<=mesLimite)).length;
    const contrMes=eLeads.filter(r=>r[F.ESTADO]==='Vendida'&&r[F.DFECH]&&mo(r[F.DFECH])===mesLimite).length;
    const pctC=e.metaContratos>0?Math.min(contrYTD/e.metaContratos*100,100):0;
    const pctCMes=e.metaContratosMes>0?Math.min(contrMes/e.metaContratosMes*100,100):0;
    const reunMes=getReunMes(e.nome,mesLimite);
    const metaMensal=mesLimite==='2026-03'?(e.metaVisitasMar||e.metaVisitas):e.metaVisitas;
    return{...e,reunYTD,faltam,pctR,contrYTD,contrMes,pctC,pctCMes,total:eLeads.length,eLeads,reunMes,metaMensal};
  }),[dados,selMes]);
  return(<div style={{display:'flex',flexDirection:'column',gap:11}}>
    <div style={{background:C.white,borderRadius:8,padding:'12px 16px',boxShadow:C.shadow}}>
      <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase'}}>Mes</span><select value={selMes} onChange={e=>setSelMes(e.target.value)} style={{padding:'5px 10px',borderRadius:6,border:`1.5px solid ${C.border}`,fontSize:11,fontFamily:FONT,outline:'none'}}>{ALL_MONTH_OPTS.map(o=><option key={o.key} value={o.key}>{o.label}</option>)}</select></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase'}}>Exec.</span><select value={selExec} onChange={e=>setSelExec(e.target.value)} style={{padding:'5px 10px',borderRadius:6,border:`1.5px solid ${C.border}`,fontSize:11,fontFamily:FONT,outline:'none'}}>{['Todos','Sandro Casagrande','Carla Cristina Lemes','Isaac Santos','Lucas Cavalcante','Rafael Brito'].map(e=><option key={e} value={e}>{e}</option>)}</select></div>
      </div>
    </div>
    <Card title="Equipe - Performance YTD">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {execStats.map(e=>{
          const mesLbl=MONTHS_LBL[MONTHS_KEY.indexOf(selMes||'2026-03')]||(selMes||'2026-03');
          const overMes=e.reunMes>=e.metaMensal,pctMes=e.metaMensal>0?Math.min(e.reunMes/e.metaMensal*100,100):0;
          return(<div key={e.nome} style={{borderRadius:8,padding:'14px',border:`1px solid ${C.border}`,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}><div style={{width:10,height:10,borderRadius:'50%',background:e.color}}/><span style={{fontWeight:700,fontSize:13,color:C.text}}>{e.alias}</span></div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Reunioes YTD{selMes?' (ate '+mesLbl+')':''}</span><span style={{fontSize:11,fontWeight:700}}>{e.reunYTD}/{e.metaVisitasAnual}</span></div>
              <div style={{height:6,background:C.grayL,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${e.pctR}%`,background:e.color,borderRadius:4}}/></div>
              <div style={{marginTop:3,fontSize:10,color:C.gray}}>Faltam <strong style={{color:e.faltam>0?C.red:C.green}}>{e.faltam}</strong></div>
              <div style={{marginTop:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Meta Mensal Reunioes ({mesLbl})</span><span style={{fontSize:11,fontWeight:700,color:overMes?C.green:C.text}}>{e.reunMes}/{e.metaMensal}{overMes&&<span style={{color:C.green,marginLeft:3}}>v</span>}</span></div>
                <div style={{height:6,background:C.grayL,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${pctMes}%`,background:overMes?C.green:e.color,borderRadius:4,opacity:0.75}}/></div>
              </div>
            </div>
            <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Contratos YTD</span><span style={{fontSize:11,fontWeight:700}}>{e.contrYTD}/{e.metaContratos}</span></div><div style={{height:6,background:C.grayL,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${e.pctC}%`,background:e.contrYTD>=e.metaContratos?C.green:e.color,borderRadius:4}}/></div></div>
            <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Contratos ({mesLbl})</span><span style={{fontSize:11,fontWeight:700,color:e.contrMes>=e.metaContratosMes?C.green:C.text}}>{e.contrMes}/{e.metaContratosMes}{e.contrMes>=e.metaContratosMes&&<span style={{color:C.green,marginLeft:3}}>✓</span>}</span></div><div style={{height:6,background:C.grayL,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${e.pctCMes}%`,background:e.contrMes>=e.metaContratosMes?C.green:e.color,borderRadius:4,opacity:0.75}}/></div></div>
          </div>);
        })}
      </div>
    </Card>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
      <ExecEvolutionChart nome="Sandro Casagrande" reunioes={SANDRO_REUNIOES} visitas={SANDRO_VISITAS} movArr={MOV_SANDRO} metaMov={315}/>
      <ExecEvolutionChart nome="Carla Cristina Lemes" reunioes={CARLA_REUNIOES} visitas={CARLA_VISITAS} movArr={MOV_CARLA} metaMov={315}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
      <ExecEvolutionChart nome="Marco Antonio" reunioes={MARCO_REUNIOES} visitas={MARCO_VISITAS} movArr={MOV_MARCO} metaMov={158}/>
      <ExecEvolutionChart nome="Isaac Santos" reunioes={ISAAC_REUNIOES} visitas={ISAAC_VISITAS} movArr={MOV_ISAAC} metaMov={158}/>
    </div>
  </div>);
}

function InternoPage(){
  const COL_AG='#1B5E20';
  const[subTab,setSubTab]=useState('overview');
  const totalLig=TATIANE_LIG_DIA.reduce((a,b)=>a+b,0);
  const totalEml=TATIANE_EML_DIA.reduce((a,b)=>a+b,0);
  const totalWha=TATIANE_WHA_DIA.reduce((a,b)=>a+b,0);
  const totalCanais=totalLig+totalEml+totalWha;
  const nEfetivas=10; // atualizado 27/03/2026
  const diasReg=ALL_DAYS_MAR.filter((_,i)=>MOV_TATIANE[i]>0).length;
  const totalAgend=0; // agendamentos da Tatiane - a definir
  const totalReal=0;
  const txConv=0;
  const canalInfo=[
    {canal:'Ligacao',qtd:totalLig,pct:totalCanais>0?Math.round(totalLig/totalCanais*100):0,fill:C.orange,icon:'📞'},
    {canal:'E-mail', qtd:totalEml,pct:totalCanais>0?Math.round(totalEml/totalCanais*100):0,fill:'#444444',icon:'✉️'},
    {canal:'WhatsApp',qtd:totalWha,pct:totalCanais>0?Math.round(totalWha/totalCanais*100):0,fill:'#AAAAAA',icon:'💬'},
  ];
  // empresas contactadas pela Tatiane
  const empresasTat=useMemo(()=>{
    const nomes=['PSM TRANSPORTES','PRESTES E VARGAS TRANSPORTES','NOMI E SOUZA TRANSPORTES','RDL LOGISTICA','TRANS FELIPPI','PEPECE TRANSPORTES','RODOMAXLOG','SAO JOAO ENCOMENDAS','MRX TRANSPORTES','TRANS TAVARES LOGISTICA','RV TRANSPORTES','RODOBECKER','RODO W CARLI','SILO FORTE TRANSPORTES','RODO ALDO','NEHRING TRANSPORTES','TRANSIVANDO TRANSPORTES','TRANSFOGUINHO TRANSPORTES','TANQUESUL TRANSPORTES','FARMLOG','SULCARGAS TRANSPORTES','SUL GRAOS TRANSPORTES','SEIKA TRANSPORTES','SALVADORI BENINI','SAJOB OPERACOES','ROSCHILDT TRANSPORTES','PAZINI GATTERMANN','NASA TRANSPORTES','TR BODINHO','TRANS OTTO','STURMER TAMANINI','TRANS MIGUEL','RODO W CARLI MAPEAMENTO'];
    return nomes;
  },[]);
  const ligAcc=buildSdrEvol(TATIANE_LIG_DIA);
  const emlAcc=buildSdrEvol(TATIANE_EML_DIA);
  const whaAcc=buildSdrEvol(TATIANE_WHA_DIA);
  const tatAgendAcum=ALL_DAYS_MAR.map(()=>0);
  const diaMap=ALL_DAYS_MAR.map((d,i)=>({
    dia:String(parseInt(d.slice(8)))+'/mar',
    ligacao:TATIANE_LIG_DIA[i]>0?TATIANE_LIG_DIA[i]:0,
    email:TATIANE_EML_DIA[i]>0?TATIANE_EML_DIA[i]:0,
    whatsapp:TATIANE_WHA_DIA[i]>0?TATIANE_WHA_DIA[i]:0,
    agendamentosAcum:tatAgendAcum[i]>0?tatAgendAcum[i]:null,
  }));
  const META_MES_CONT=500;
  const pctCont=Math.min(Math.round(totalCanais/META_MES_CONT*100),100);
  const faltamCont=Math.max(0,META_MES_CONT-totalCanais);
  const mkAgendDot=(props)=>{const{cx,cy,index,value}=props;if(!value)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;const prev=index>0?diaMap[index-1]?.agendamentosAcum:null;if(value===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={6} fill={COL_AG} stroke="#fff" strokeWidth={1.5}/>;};
  const mkAgendLabel=(props)=>{const{x,y,index,value}=props;if(!value)return null;const prev=index>0?diaMap[index-1]?.agendamentosAcum:null;if(value===prev&&index>0)return null;return <text key={index} x={x} y={y-11} textAnchor="middle" fill={COL_AG} fontSize={11} fontWeight={500} fontFamily={FONT}>{value}</text>;};
  const COL_L=C.orange,COL_E='#444444',COL_W='#AAAAAA';
  const mkDot=(key,col)=>(props)=>{const{cx,cy,index}=props;const val=diaMap[index][key];const prev=index>0?diaMap[index-1][key]:null;if(val===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={5} fill={col} stroke="#fff" strokeWidth={1.5}/>;};
  const mkLabel=(key,col)=>(props)=>{const{x,y,index}=props;const val=diaMap[index][key];const prev=index>0?diaMap[index-1][key]:null;if(val===prev&&index>0)return null;return <text key={index} x={x} y={y-10} textAnchor="middle" fill={col} fontSize={10} fontWeight={500} fontFamily={FONT}>{val||''}</text>;};

  return(<div style={{display:'flex',flexDirection:'column',gap:11,fontFamily:FONT}}>
    {/* ── HEADER ── */}
    <div style={{background:C.gray,borderRadius:8,padding:'16px 20px',boxShadow:C.shadow,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div style={{width:48,height:48,borderRadius:'50%',background:C.white,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:16,fontWeight:600,color:C.gray}}>TG</span></div>
      <div>
        <div style={{color:'rgba(255,255,255,0.75)',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>Executiva Interna</div>
        <div style={{color:C.white,fontSize:20,fontWeight:800}}>Tatiane Gomes</div>
        <div style={{color:'rgba(255,255,255,0.7)',fontSize:11}}>Inicio: 25/03/2026 — {diasReg} dia{diasReg!==1?'s':''} registrado{diasReg!==1?'s':''}</div>
      </div>
      <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap'}}>
        {canalInfo.map(d=>(<div key={d.canal} style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}><div style={{fontSize:18,marginBottom:2}}>{d.icon}</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{d.qtd}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:600,textTransform:'uppercase'}}>{d.canal}</div></div>))}
        <div style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}><div style={{fontSize:18,marginBottom:2}}>✅</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{nEfetivas}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:600,textTransform:'uppercase'}}>Lig. Efetivas</div></div>
        <div style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}><div style={{fontSize:18,marginBottom:2}}>🏢</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{empresasTat.length}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:600,textTransform:'uppercase'}}>Empresas</div></div>
      </div>
    </div>

    {/* ── SUB-TABS ── */}
    <div style={{background:C.white,borderRadius:8,boxShadow:C.shadow,overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:`1px solid ${C.border}`}}>
        {[{id:'overview',l:'Overview'},{id:'agendamentos',l:'Agendamentos'}].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{padding:'9px 20px',border:'none',background:'none',cursor:'pointer',fontWeight:subTab===t.id?700:500,fontSize:12,color:subTab===t.id?C.orange:C.gray,borderBottom:subTab===t.id?`2.5px solid ${C.orange}`:'2.5px solid transparent',fontFamily:FONT,whiteSpace:'nowrap'}}>{t.l}</button>
        ))}
      </div>
      <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:11}}>
      {subTab==='overview'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
    {/* ── KPIs ── */}
    <div style={{display:'flex',gap:9}}>
      <KPICard title="Total Atividades" value={totalCanais} icon="⚡" note={diasReg+' dias ativos'}/>
      <KPICard title="Ligacoes" value={totalLig} icon="📞" note={canalInfo[0].pct+'% do total'}/>
      <KPICard title="E-mails" value={totalEml} icon="✉️" note={canalInfo[1].pct+'% do total'}/>
      <KPICard title="Empresas" value={empresasTat.length} icon="🏢"/>
      <KPICard title="Agendamentos" value={totalAgend} icon="📅" note={'Meta: '+META_AGEND_MES}/>
    </div>

    {/* ── PERFORMANCE CARD ── */}
    <div style={{maxWidth:320}}>
      <div style={{borderRadius:8,padding:'14px',border:`1px solid ${C.border}`,display:'flex',flexDirection:'column',gap:8,background:C.white,boxShadow:C.shadow}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}><div style={{width:10,height:10,borderRadius:'50%',background:C.orange}}/><span style={{fontWeight:700,fontSize:13,color:C.text}}>Tatiane Gomes</span></div>
        {/* Reunioes YTD */}
        <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Reunioes YTD (Mar/26)</span><span style={{fontSize:11,fontWeight:700,color:C.gray}}>— / —</span></div><div style={{height:6,background:C.grayL,borderRadius:4}}/><div style={{marginTop:3,fontSize:10,color:C.gray}}>Meta a definir</div></div>
        {/* Meta Mensal Reunioes */}
        <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Meta Mensal Reunioes (Mar/26)</span><span style={{fontSize:11,fontWeight:700,color:C.gray}}>— / —</span></div><div style={{height:6,background:C.grayL,borderRadius:4}}/></div>
        {/* Contratos YTD */}
        <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Contratos YTD</span><span style={{fontSize:11,fontWeight:700,color:C.gray}}>— / —</span></div><div style={{height:6,background:C.grayL,borderRadius:4}}/></div>
        {/* Contratos Mensal */}
        <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:C.gray}}>Contratos (Mar/26)</span><span style={{fontSize:11,fontWeight:700,color:C.gray}}>— / —</span></div><div style={{height:6,background:C.grayL,borderRadius:4}}/></div>
      </div>
    </div>

    {/* ── GRÁFICO ATIVIDADES POR DIA ── */}
    <Card title="Atividades por Dia — por Canal + Agendamentos Acumulados">
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}><div style={{width:20,height:2.5,background:COL_AG,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_AG}}/><span style={{fontSize:10,fontWeight:700,color:COL_AG}}>Agendamentos Acumulados (eixo dir.)</span></div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={diaMap} margin={{top:20,right:45,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
          <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="left" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="right" orientation="right" tick={{fontSize:10,fill:COL_AG,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,Math.max(totalAgend+2,5)]}/>
          <Tooltip content={<Tip/>}/><Legend wrapperStyle={{fontSize:10,fontFamily:FONT}}/>
          <Bar yAxisId="left" dataKey="ligacao" name="Ligacao" stackId="a" fill={C.orange} barSize={40}><LabelList dataKey="ligacao" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          <Bar yAxisId="left" dataKey="email" name="E-mail" stackId="a" fill="#444444" barSize={40}><LabelList dataKey="email" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          <Bar yAxisId="left" dataKey="whatsapp" name="WhatsApp" stackId="a" fill="#AAAAAA" radius={[4,4,0,0]} barSize={40}><LabelList dataKey="whatsapp" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          <Line yAxisId="right" dataKey="agendamentosAcum" name="Agend. Acumulados" stroke={COL_AG} strokeWidth={1.5} type="monotone" connectNulls={true} dot={mkAgendDot} label={mkAgendLabel}/>
        </ComposedChart>
      </ResponsiveContainer>
    </Card>

    {/* ── AGENDAMENTOS ACUMULADOS VS METAS ── */}
    {(()=>{
      const METAS=[20,40,60];
      const CORES=[C.orange,C.gray,'#AAAAAA'];
      const atual=totalAgend;
      const chartData=ALL_DAYS_MAR.map((d,i)=>({dia:String(parseInt(d.slice(8)))+'/mar',real:tatAgendAcum[i]}));
      const mkDotR=(props)=>{const{cx,cy,index,value}=props;const prev=index>0?chartData[index-1]?.real:null;if(value===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={6} fill={COL_AG} stroke="#fff" strokeWidth={1.5}/>;};
      const mkLblR=(props)=>{const{x,y,index,value}=props;const prev=index>0?chartData[index-1]?.real:null;if(value===prev&&index>0)return null;return <text key={index} x={x} y={y-11} textAnchor="middle" fill={COL_AG} fontSize={12} fontWeight={500} fontFamily={FONT}>{value}</text>;};
      return(
        <Card title="Agendamentos Acumulados vs Metas — Tatiane Gomes">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData} margin={{top:24,right:20,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
              <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,60]}/>
              <Tooltip content={<Tip/>}/>
              <ReferenceLine y={20} stroke={C.orange} strokeWidth={1} strokeDasharray="5 3" label={{value:'Meta 20',fill:C.orange,fontSize:9,fontWeight:700,position:'insideTopRight'}}/>
              <ReferenceLine y={40} stroke={C.gray}   strokeWidth={1} strokeDasharray="5 3" label={{value:'Meta 40',fill:C.gray,  fontSize:9,fontWeight:700,position:'insideTopRight'}}/>
              <ReferenceLine y={60} stroke="#AAAAAA"  strokeWidth={1} strokeDasharray="5 3" label={{value:'Meta 60',fill:'#AAAAAA',fontSize:9,fontWeight:700,position:'insideTopRight'}}/>
              <Line dataKey="real" name="Acumulado Real" stroke={COL_AG} strokeWidth={1.5} type="monotone" connectNulls dot={mkDotR} label={mkLblR}/>
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {METAS.map((m,i)=>{const falta=Math.max(0,m-atual);const atingida=atual>=m;const pct=Math.min(Math.round(atual/m*100),100);const cor=CORES[i];return(<div key={m} style={{borderRadius:6,padding:'9px 12px',background:atingida?C.gL:'#FAFAFA',border:`1px solid ${atingida?C.green:cor}`,display:'flex',flexDirection:'column',gap:5}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:9,fontWeight:700,color:cor,textTransform:'uppercase',letterSpacing:'0.06em'}}>Meta {m}</span>{atingida&&<span style={{fontSize:10,fontWeight:600,color:C.green}}>✓ Atingida</span>}</div><div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontSize:20,fontWeight:600,color:atingida?C.green:C.text,lineHeight:1}}>{atual}</span><span style={{fontSize:11,color:C.gray}}>/ {m}</span><span style={{fontSize:10,fontWeight:700,color:atingida?C.green:cor,marginLeft:'auto'}}>{pct}%</span></div><div style={{height:5,background:C.grayL,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:atingida?C.green:cor,borderRadius:3}}/></div><div style={{fontSize:10,color:atingida?C.green:C.red,fontWeight:600,textAlign:'right'}}>{atingida?'Meta atingida!':'Faltam '+falta}</div></div>);})}
          </div>
        </Card>
      );
    })()}

    {/* ── MIX DE CANAIS + EVOLUÇÃO DIÁRIA ── */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1.8fr',gap:11}}>
      <Card title="Mix de Canais">
        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
          {canalInfo.map(d=>{const pctMeta=Math.min(Math.round(d.qtd/META_MES_CONT*100),100);return(<div key={d.canal}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:12,fontWeight:600}}>{d.icon} {d.canal}</span><span><strong style={{color:d.fill,fontSize:13}}>{d.qtd}</strong><span style={{fontSize:11,color:C.gray}}> ({pctMeta}% da meta)</span></span></div>
            <div style={{height:12,background:C.grayL,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${pctMeta}%`,background:d.fill,borderRadius:6}}/></div>
          </div>);})}
        </div>
      </Card>
      <Card title="Evolucao Diaria - Tatiane Gomes">
        <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_L,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_L}}/><span style={{fontSize:10,fontWeight:700,color:COL_L}}>Ligacoes</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_E,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_E}}/><span style={{fontSize:10,fontWeight:700,color:COL_E}}>E-mails</span></div>
          <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:22,height:3,background:COL_W,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_W}}/><span style={{fontSize:10,fontWeight:700,color:COL_W}}>WhatsApp</span></div>
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10,background:COL_L+'18',color:COL_L,border:`1.5px solid ${COL_L}`}}>{totalLig} lig.</span>
            <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10,background:COL_E+'18',color:COL_E,border:`1.5px solid ${COL_E}`}}>{totalEml} email</span>
            <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10,background:'#AAAAAA18',color:COL_W,border:`1.5px solid ${COL_W}`}}>{totalWha} whats</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={diaMap} margin={{top:28,right:16,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
            <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,'dataMax+15']}/>
            <Tooltip content={<Tip/>}/>
            <Line dataKey="ligacao" name="Ligacoes" stroke={COL_L} strokeWidth={1.5} type="monotone" dot={mkDot('ligacao',COL_L)} label={mkLabel('ligacao',COL_L)}/>
            <Line dataKey="email" name="E-mails" stroke={COL_E} strokeWidth={1.5} type="monotone" dot={mkDot('email',COL_E)} label={mkLabel('email',COL_E)}/>
            <Line dataKey="whatsapp" name="WhatsApp" stroke={COL_W} strokeWidth={1.5} strokeDasharray="5 3" type="monotone" dot={mkDot('whatsapp',COL_W)} label={mkLabel('whatsapp',COL_W)}/>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>

    {/* ── META MENSAL DE CONTATOS ── */}
    <Card>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <span style={{fontSize:11,fontWeight:700,color:C.text}}>Meta Mensal de Contatos (Mar/26)</span>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:12,fontWeight:600,color:C.orange}}>{totalCanais}</span>
          <span style={{fontSize:11,color:C.gray}}>/ {META_MES_CONT}</span>
          <span style={{fontSize:11,fontWeight:700,color:pctCont>=100?C.green:C.gray}}>{pctCont}%</span>
        </div>
      </div>
      <div style={{height:10,background:C.border,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${pctCont}%`,background:pctCont>=100?C.green:C.orange,borderRadius:6}}/></div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
        <span style={{fontSize:10,color:C.gray}}>125 interacoes/semana - 25/dia</span>
        <span style={{fontSize:10,color:faltamCont>0?C.red:C.green,fontWeight:600}}>{faltamCont>0?'Faltam '+faltamCont+' contatos':'Meta atingida!'}</span>
      </div>
    </Card>
      </div>)}

    {/* ── AGENDAMENTOS ── */}
      {subTab==='agendamentos'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
      {(()=>{
      const tatTotalAgend=TATIANE_AGENDAMENTOS.length;
      const tatTotalReal=TATIANE_AGENDAMENTOS.filter(d=>d.status===STATUS_REALIZADA).length;
      const tatTxConv=tatTotalAgend>0?Math.round(tatTotalReal/tatTotalAgend*100):0;
      const tatTotalMov=TATIANE_MOV.reduce((a,d)=>a+d.mov,0);
      const tatMediaMov=TATIANE_MOV.length>0?+(tatTotalMov/TATIANE_MOV.length).toFixed(1):0;
      return(<div style={{display:'flex',flexDirection:'column',gap:11}}>
        <div style={{display:'flex',gap:9}}>
          <KPICard title="Total Movs." value={tatTotalMov} icon="🔄" note={TATIANE_MOV.length+' dias'}/>
          <KPICard title="Media/Dia" value={tatMediaMov} icon="📈" note={'Meta: '+META_DIA+'/dia'}/>
          <KPICard title="Agendamentos" value={tatTotalAgend} icon="📅" note={'Meta: '+META_AGEND_MES}/>
          <KPICard title="Conversao" value={tatTxConv+'%'} icon="🎯" note={tatTotalReal+' realizadas'}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:11}}>
          <Card title="Status dos Agendamentos">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{label:'Total',value:tatTotalAgend},{label:'Realizadas',value:tatTotalReal},{label:'Agendadas',value:tatTotalAgend-tatTotalReal}]} margin={{top:20,right:20,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="value" name="Qtd." radius={[5,5,0,0]} barSize={52}>{[C.orange,C.green,C.gray].map((f,i)=>(<Cell key={i} fill={f}/>))}<LabelList dataKey="value" position="top" style={{fontSize:13,fontWeight:700}}/></Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Movimentacoes por Dia">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={TATIANE_MOV} margin={{top:20,right:20,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
                <XAxis dataKey="dia" tick={{fontSize:11,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} domain={[0,'dataMax+5']}/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine y={META_DIA} stroke={C.green} strokeWidth={1.5} strokeDasharray="5 3" label={{value:'Meta 25',fill:C.green,fontSize:10,position:'insideTopRight',fontWeight:700}}/>
                <Bar dataKey="mov" name="Movimentacoes" radius={[5,5,0,0]} barSize={52}>{TATIANE_MOV.map((d,i)=>(<Cell key={i} fill={d.mov>=25?'#2E7D32':d.mov>=11?'#F59E0B':d.mov>0?'#C62828':'#DDDDDD'}/>))}<LabelList dataKey="mov" position="top" style={{fontSize:11,fontWeight:800}}/></Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:'flex',gap:12,marginTop:10,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:10,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em'}}>Legenda:</span>
              {[{cor:'#C62828',bg:'#FFEBEE',label:'0–10',desc:'Abaixo do esperado'},{cor:'#F59E0B',bg:'#FFFBEB',label:'11–24',desc:'Em progresso'},{cor:'#2E7D32',bg:'#E8F5E9',label:'≥25',desc:'Meta atingida'}].map(f=>(<div key={f.label} style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:12,height:12,borderRadius:3,background:f.cor,flexShrink:0}}/><span style={{fontSize:10,fontWeight:700,color:f.cor,background:f.bg,padding:'1px 6px',borderRadius:4}}>{f.label}</span><span style={{fontSize:10,color:'#666'}}>{f.desc}</span></div>))}
            </div>
            <div style={{marginTop:10,padding:'12px 14px',background:C.grayL,borderRadius:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:C.text}}>Meta Mensal de Contatos (Mar/26)</span>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.orange}}>{tatTotalMov}</span>
                  <span style={{fontSize:11,color:C.gray}}>/ 500</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.gray}}>{Math.min(Math.round(tatTotalMov/500*100),100)}%</span>
                </div>
              </div>
              <div style={{height:10,background:C.border,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(Math.round(tatTotalMov/500*100),100)}%`,background:C.orange,borderRadius:6}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
                <span style={{fontSize:10,color:C.gray}}>125 interacoes/semana - 25/dia</span>
                <span style={{fontSize:10,color:C.red,fontWeight:600}}>Faltam {Math.max(0,500-tatTotalMov)} contatos</span>
              </div>
            </div>
          </Card>
        </div>
        <Card title={"Agendamentos Marco - "+tatTotalAgend}>
          <div style={{overflowX:'auto',borderRadius:5,border:`1px solid ${C.border}`}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:FONT}}>
              <thead><tr style={{background:C.orange}}>
                <th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center',width:36}}>#</th>
                <th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'left'}}>Empresa</th>
                <th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Tamanho</th>
                <th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Status</th>
                <th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>CRM</th>
                <th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Motivo de Perda</th>
              </tr></thead>
              <tbody>
                {tatTotalAgend===0&&(<tr><td colSpan={6} style={{padding:'24px',textAlign:'center',color:C.gray,fontSize:12}}>Nenhum agendamento registrado ainda.</td></tr>)}
                {TATIANE_AGENDAMENTOS.map((d,i)=>{const isReal=d.status===STATUS_REALIZADA;const stColor=isReal?C.green:C.orange;const stBg=isReal?C.gL:C.oL;const stLabel=isReal?'Reuniao Realizada':'Reuniao Agendada';const crmColor=d.crm==='Perdida'?C.red:isReal?C.green:C.orange;const crmBg=d.crm==='Perdida'?C.rL:isReal?C.gL:C.oL;return(<tr key={i} style={{...tRow(i),fontSize:12}}><td style={{padding:'9px 12px',color:C.gray,fontWeight:700,textAlign:'center'}}>{i+1}</td><td style={{padding:'9px 12px',fontWeight:700,color:C.text}}>{d.empresa}</td><td style={{padding:'9px 12px',textAlign:'center'}}><Badge label={d.perfil} color={d.perfil==='ETP'?C.blue:C.orange} bg={d.perfil==='ETP'?C.bL:C.oL}/></td><td style={{padding:'9px 12px',textAlign:'center'}}><Badge label={stLabel} color={stColor} bg={stBg}/></td><td style={{padding:'9px 12px',textAlign:'center'}}><div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'center'}}><Badge label={d.crm} color={crmColor} bg={crmBg}/>{d.etapaCrm&&<Badge label={d.etapaCrm} color={C.blue} bg={C.bL}/>}</div></td><td style={{padding:'9px 12px',textAlign:'center'}}>{d.motivo?<Badge label={d.motivo} color={C.red} bg={C.rL}/>:<span style={{color:C.gray}}>-</span>}</td></tr>);})}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:12}}><PBar label={'Meta mensal ('+META_AGEND_MES+')'} actual={tatTotalAgend} meta={META_AGEND_MES}/></div>
        </Card>
      </div>);
    })()}
      </div>)}
      </div>
    </div>
  </div>);
}

const COL_AGEND_ACUM='#1B5E20';

function SDRAtivChart({diaMap,totalAgend,mkAgendDot,mkAgendLabel}){
  const[visMode,setVisMode]=useState('diario');
  const btnStyle=(active)=>({padding:'4px 14px',borderRadius:20,border:`1.5px solid ${active?C.orange:C.border}`,background:active?C.orange:C.white,color:active?C.white:C.gray,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:FONT});
  const mensalData=SDR_MENSAL.map(m=>({dia:m.mes,ligacao:m.ligacao,email:m.email,whatsapp:m.whatsapp,agendamentosAcum:m.agendamentos}));
  const chartData=visMode==='diario'?diaMap:mensalData;
  const maxAgend=visMode==='diario'?totalAgend+2:Math.max(...SDR_MENSAL.map(m=>m.agendamentos))+2;
  const barSize=visMode==='mensal'?80:40;
  return(
    <Card title="Atividades por Dia — por Canal + Agendamentos Acumulados">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:20,height:2.5,background:COL_AGEND_ACUM,borderRadius:2}}/><div style={{width:7,height:7,borderRadius:'50%',background:COL_AGEND_ACUM}}/><span style={{fontSize:10,fontWeight:700,color:COL_AGEND_ACUM}}>Agendamentos Acumulados (eixo dir.)</span>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>setVisMode('diario')} style={btnStyle(visMode==='diario')}>📅 Diário (Mar/26)</button>
          <button onClick={()=>setVisMode('mensal')} style={btnStyle(visMode==='mensal')}>📊 Compilado Mensal</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{top:20,right:45,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
          <XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="left" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="right" orientation="right" tick={{fontSize:10,fill:COL_AGEND_ACUM,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,maxAgend]}/>
          <Tooltip content={<Tip/>}/>
          <Legend wrapperStyle={{fontSize:10,fontFamily:FONT}}/>
          <Bar yAxisId="left" dataKey="ligacao" name="Ligacao" stackId="a" fill={C.orange} barSize={barSize}><LabelList dataKey="ligacao" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          <Bar yAxisId="left" dataKey="email" name="E-mail" stackId="a" fill="#444444" barSize={barSize}><LabelList dataKey="email" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          <Bar yAxisId="left" dataKey="whatsapp" name="WhatsApp" stackId="a" fill="#AAAAAA" radius={[4,4,0,0]} barSize={barSize}><LabelList dataKey="whatsapp" position="inside" style={{fontSize:9,fill:'#fff',fontWeight:700}} formatter={v=>v>0?v:''}/></Bar>
          <Line yAxisId="right" dataKey="agendamentosAcum" name="Agend. Acumulados" stroke={COL_AGEND_ACUM} strokeWidth={1.5} type="monotone" connectNulls={true} dot={mkAgendDot} label={mkAgendLabel}/>
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

function SDRPage({dateIni,dateFim}){
  const[subSDR,setSubSDR]=useState('overview');
  const hasFilter=dateIni||dateFim;
  const movFilt=useMemo(()=>hasFilter?SDR_MOV.filter(d=>inRange(d.data,dateIni,dateFim)):SDR_MOV,[dateIni,dateFim,hasFilter]);
  const ativNorm=useMemo(()=>SDR_ATIV.map(d=>({...d})),[]);
  const ativFilt=useMemo(()=>hasFilter?ativNorm.filter(d=>inRange(d.data,dateIni,dateFim)):ativNorm,[ativNorm,dateIni,dateFim,hasFilter]);
  const totalMov=movFilt.reduce((a,d)=>a+d.mov,0),mediaMov=movFilt.length>0?+(totalMov/movFilt.length).toFixed(1):0;
  const totalAgend=SDR_AGENDAMENTOS.length,totalReal=SDR_AGENDAMENTOS.filter(d=>d.status===STATUS_REALIZADA).length;
  const txConv=totalAgend>0?Math.round(totalReal/totalAgend*100):0;
  const nLig=ativFilt.filter(d=>d.canal==='ligacao').length,nEmail=ativFilt.filter(d=>d.canal==='email').length,nWhats=ativFilt.filter(d=>d.canal==='whatsapp').length;
  const nEfetivas=ativFilt.filter(d=>d.canal==='ligacao'&&EFETIVAS.includes(d.empresa)).length+9;
  const totalCanais=nLig+nEmail+nWhats;
  const canalInfo=[{canal:'Ligacao',qtd:nLig,pct:totalCanais>0?Math.round(nLig/totalCanais*100):0,fill:C.orange,icon:'📞'},{canal:'E-mail',qtd:nEmail,pct:totalCanais>0?Math.round(nEmail/totalCanais*100):0,fill:'#444444',icon:'✉️'},{canal:'WhatsApp',qtd:nWhats,pct:totalCanais>0?Math.round(nWhats/totalCanais*100):0,fill:'#AAAAAA',icon:'💬'}];
  const empresaMap=useMemo(()=>{const m={};ativFilt.forEach(d=>{if(!m[d.empresa])m[d.empresa]={empresa:d.empresa,ligacao:0,email:0,whatsapp:0,total:0};m[d.empresa][d.canal]=(m[d.empresa][d.canal]||0)+1;m[d.empresa].total++;});return Object.values(m).sort((a,b)=>b.total-a.total);},[ativFilt]);
  const nMultiCanal=useMemo(()=>empresaMap.filter(e=>e.ligacao>0&&e.email>0).length,[empresaMap]);
  const diaMap=useMemo(()=>{
    const dias=[...new Set(ativFilt.map(d=>d.data))].sort();
    return dias.map(dia=>{
      const idx=SDR_ATIV_DATES.indexOf(dia);
      return({dia:dia.split('-').reverse().slice(0,2).join('/'),ligacao:ativFilt.filter(d=>d.data===dia&&d.canal==='ligacao').length||undefined,email:ativFilt.filter(d=>d.data===dia&&d.canal==='email').length||undefined,whatsapp:ativFilt.filter(d=>d.data===dia&&d.canal==='whatsapp').length||undefined,agendamentosAcum:idx>=0?SDR_AGEND_ACUM[idx]:null});
    });
  },[ativFilt]);
  const BONIF=[{min:1,max:20,valor:20,cenario:400},{min:21,max:40,valor:25,cenario:1000},{min:41,max:60,valor:30,cenario:1800}];
  const faixa=BONIF.find(b=>totalAgend>=b.min&&totalAgend<=b.max)||null;
  const proxFaixa=faixa?BONIF.find(b=>b.min>faixa.min):BONIF[0];
  const bonifAtual=faixa?totalAgend*faixa.valor:0;
  const pctFaixa=faixa?Math.min((totalAgend-faixa.min+1)/(faixa.max-faixa.min+1)*100,100):0;
  const faltamProx=proxFaixa?proxFaixa.min-totalAgend:0;
  const subTabs=[{id:'overview',l:'Overview'},{id:'canais',l:'Canais'},{id:'empresas',l:'Empresas'},{id:'agendamentos',l:'Agendamentos'},{id:'bonificacao',l:'Bonificacao'}];
  const mkAgendDot=(props)=>{const{cx,cy,index,value}=props;if(value===null||value===undefined)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;const prev=index>0?diaMap[index-1]?.agendamentosAcum:null;if(value===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={6} fill={COL_AGEND_ACUM} stroke="#fff" strokeWidth={1.5}/>;};
  const mkAgendLabel=(props)=>{const{x,y,index,value}=props;if(value===null||value===undefined)return null;const prev=index>0?diaMap[index-1]?.agendamentosAcum:null;if(value===prev&&index>0)return null;return <text key={index} x={x} y={y-11} textAnchor="middle" fill={COL_AGEND_ACUM} fontSize={11} fontWeight={500} fontFamily={FONT}>{value}</text>;};

  return(<div style={{display:'flex',flexDirection:'column',gap:11,fontFamily:FONT}}>
    <div style={{background:C.gray,borderRadius:8,padding:'16px 20px',boxShadow:C.shadow,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div style={{width:48,height:48,borderRadius:'50%',background:C.white,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:16,fontWeight:600,color:C.gray}}>FV</span></div>
      <div><div style={{color:'rgba(255,255,255,0.75)',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>SDR</div><div style={{color:C.white,fontSize:20,fontWeight:800}}>Fabiana Vaz</div><div style={{color:'rgba(255,255,255,0.7)',fontSize:11}}>Inicio: 11/03/2026 - {movFilt.length} dias registrados</div></div>
      <div style={{marginLeft:'auto',display:'flex',gap:8,flexWrap:'wrap'}}>
        {canalInfo.map(d=>(<div key={d.canal} style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}><div style={{fontSize:18,marginBottom:2}}>{d.icon}</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{d.qtd}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:600,textTransform:'uppercase'}}>{d.canal}</div></div>))}
        <div style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}><div style={{fontSize:18,marginBottom:2}}>✅</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{nEfetivas}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:600,textTransform:'uppercase'}}>Lig. Efetivas</div></div>
        <div style={{background:'rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 14px',textAlign:'center',border:'1px solid rgba(255,255,255,0.2)'}}><div style={{fontSize:18,marginBottom:2}}>🏢</div><div style={{fontSize:20,fontWeight:800,color:C.white}}>{empresaMap.length}</div><div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:600,textTransform:'uppercase'}}>Empresas</div></div>
      </div>
    </div>
    <div style={{background:C.white,borderRadius:8,boxShadow:C.shadow,overflow:'hidden'}}>
      <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,overflowX:'auto'}}>
        {subTabs.map(t=>(<button key={t.id} onClick={()=>setSubSDR(t.id)} style={{padding:'9px 16px',border:'none',background:'none',cursor:'pointer',fontWeight:subSDR===t.id?700:500,fontSize:11.5,color:subSDR===t.id?C.orange:C.gray,borderBottom:subSDR===t.id?`2.5px solid ${C.orange}`:'2.5px solid transparent',fontFamily:FONT,whiteSpace:'nowrap'}}>{t.l}</button>))}
      </div>
      <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:11}}>
        {subSDR==='overview'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
          <div style={{display:'flex',gap:9}}><KPICard title="Total Atividades" value={totalCanais} icon="⚡" note={movFilt.length+' dias ativos'}/><KPICard title="Ligacoes" value={nLig} icon="📞" note={canalInfo[0].pct+'% do total'}/><KPICard title="E-mails" value={nEmail} icon="✉️" note={canalInfo[1].pct+'% do total'}/><KPICard title="Empresas" value={empresaMap.length} icon="🏢"/><KPICard title="Agendamentos" value={totalAgend} icon="📅" note={'Meta: '+META_AGEND_MES}/></div>
          <SDRAtivChart diaMap={diaMap} totalAgend={totalAgend} mkAgendDot={mkAgendDot} mkAgendLabel={mkAgendLabel}/>
          {(()=>{
            const METAS_SDR=[20,40,60];
            const COL_M1=C.orange,COL_M2=C.gray,COL_M3='#AAAAAA';
            const metaCores=[COL_M1,COL_M2,COL_M3];
            const agendChartData=SDR_ATIV_DATES.map((date,i)=>({dia:date.slice(8).replace(/^0/,'')+'/mar',real:SDR_AGEND_ACUM[i],meta1:20,meta2:40,meta3:60}));
            const atual=totalAgend;
            const mkDotReal=(props)=>{const{cx,cy,index,value}=props;const prev=index>0?agendChartData[index-1]?.real:null;if(value===prev&&index>0)return <circle key={index} cx={cx} cy={cy} r={0} fill="none"/>;return <circle key={index} cx={cx} cy={cy} r={6} fill={COL_AGEND_ACUM} stroke="#fff" strokeWidth={1.5}/>;};
            const mkLabelReal=(props)=>{const{x,y,index,value}=props;const prev=index>0?agendChartData[index-1]?.real:null;if(value===prev&&index>0)return null;return <text key={index} x={x} y={y-11} textAnchor="middle" fill={COL_AGEND_ACUM} fontSize={12} fontWeight={500} fontFamily={FONT}>{value}</text>;};
            return(
              <Card title="Agendamentos Acumulados vs Metas — Fabiana Vaz">
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={agendChartData} margin={{top:24,right:20,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/><XAxis dataKey="dia" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false} domain={[0,60]}/><Tooltip content={<Tip/>}/>
                    <ReferenceLine y={20} stroke={COL_M1} strokeWidth={1} strokeDasharray="5 3" label={{value:'Meta 20',fill:COL_M1,fontSize:9,fontWeight:700,position:'insideTopRight'}}/>
                    <ReferenceLine y={40} stroke={COL_M2} strokeWidth={1} strokeDasharray="5 3" label={{value:'Meta 40',fill:COL_M2,fontSize:9,fontWeight:700,position:'insideTopRight'}}/>
                    <ReferenceLine y={60} stroke={COL_M3} strokeWidth={1} strokeDasharray="5 3" label={{value:'Meta 60',fill:COL_M3,fontSize:9,fontWeight:700,position:'insideTopRight'}}/>
                    <Line dataKey="real" name="Acumulado Real" stroke={COL_AGEND_ACUM} strokeWidth={1.5} type="monotone" connectNulls dot={mkDotReal} label={mkLabelReal}/>
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {METAS_SDR.map((m,i)=>{const falta=Math.max(0,m-atual);const atingida=atual>=m;const pct=Math.min(Math.round(atual/m*100),100);const cor=metaCores[i];return(<div key={m} style={{borderRadius:6,padding:'9px 12px',background:atingida?C.gL:'#FAFAFA',border:`1px solid ${atingida?C.green:cor}`,display:'flex',flexDirection:'column',gap:5}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:9,fontWeight:700,color:cor,textTransform:'uppercase',letterSpacing:'0.06em'}}>Meta {m}</span>{atingida&&<span style={{fontSize:10,fontWeight:600,color:C.green}}>✓ Atingida</span>}</div><div style={{display:'flex',alignItems:'baseline',gap:5}}><span style={{fontSize:20,fontWeight:600,color:atingida?C.green:C.text,lineHeight:1}}>{atual}</span><span style={{fontSize:11,color:C.gray}}>/ {m}</span><span style={{fontSize:10,fontWeight:700,color:atingida?C.green:cor,marginLeft:'auto'}}>{pct}%</span></div><div style={{height:5,background:C.grayL,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:atingida?C.green:cor,borderRadius:3}}/></div><div style={{fontSize:10,color:atingida?C.green:C.red,fontWeight:600,textAlign:'right'}}>{atingida?'Meta atingida!':'Faltam '+falta}</div></div>);})}
                </div>
              </Card>
            );
          })()}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.8fr',gap:11}}>
            <Card title="Mix de Canais"><div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>{canalInfo.map(d=>(<div key={d.canal}><div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:12,fontWeight:600}}>{d.icon} {d.canal}</span><span><strong style={{color:d.fill,fontSize:13}}>{d.qtd}</strong><span style={{fontSize:11,color:C.gray}}> ({d.pct}%)</span></span></div><div style={{height:12,background:C.grayL,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${d.pct}%`,background:d.fill,borderRadius:6}}/></div></div>))}</div></Card>
            <SDREvolutionChart/>
          </div>
        </div>)}
        {subSDR==='canais'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
          <div style={{display:'flex',gap:9}}>{canalInfo.map(d=>(<div key={d.canal} style={{flex:1,background:C.white,borderRadius:8,padding:'20px',border:`2px solid ${d.fill}`,textAlign:'center',boxShadow:C.shadow}}><div style={{fontSize:32,marginBottom:8}}>{d.icon}</div><div style={{fontSize:36,fontWeight:600,color:d.fill,lineHeight:1}}>{d.qtd}</div><div style={{fontSize:13,fontWeight:700,color:C.text,marginTop:6}}>{d.canal}</div><div style={{fontSize:11,color:C.gray,marginTop:2}}>{d.pct}% do total</div><div style={{marginTop:10,height:8,background:C.grayL,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${d.pct}%`,background:d.fill,borderRadius:4}}/></div></div>))}</div>
        </div>)}
        {subSDR==='empresas'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
          <div style={{display:'flex',gap:9}}><KPICard title="Empresas Contactadas" value={empresaMap.length} icon="🏢"/><KPICard title="Maior Volume" value={empresaMap[0]?empresaMap[0].total:0} icon="🔝" note={empresaMap[0]?empresaMap[0].empresa.split(' ').slice(0,2).join(' '):''}/><KPICard title="So Ligacao" value={empresaMap.filter(e=>e.ligacao>0&&e.email===0).length} icon="📞" note="empresas"/><KPICard title="So E-mail" value={empresaMap.filter(e=>e.email>0&&e.ligacao===0).length} icon="✉️" note="empresas"/><KPICard title="Multi-canal" value={nMultiCanal} icon="🔀" note="ligacao + e-mail"/></div>
          <Card title={"Atividades por Empresa - "+empresaMap.length+" empresas"}><div style={{overflowX:'auto',borderRadius:5,border:`1px solid ${C.border}`}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11,fontFamily:FONT}}><TblHead cols={['Empresa','Total','Lig.','Email','WhatsApp','Canal']}/><tbody>{empresaMap.map((r,i)=>{const multi=r.ligacao>0&&r.email>0;return(<tr key={i} style={tRow(i)}><td style={{padding:'6px 10px',fontWeight:600,color:C.text,maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.empresa}</td><td style={{padding:'6px 10px',fontWeight:600,fontSize:14,color:C.orange}}>{r.total}</td><td style={{padding:'6px 10px',textAlign:'center'}}>{r.ligacao>0?<span style={{fontWeight:700,color:C.orange,fontSize:13}}>{r.ligacao}</span>:<span style={{color:'#DDD'}}>-</span>}</td><td style={{padding:'6px 10px',textAlign:'center'}}>{r.email>0?<span style={{fontWeight:700,color:'#444',fontSize:13}}>{r.email}</span>:<span style={{color:'#DDD'}}>-</span>}</td><td style={{padding:'6px 10px',textAlign:'center'}}>{r.whatsapp>0?<span style={{fontWeight:700,color:'#AAA',fontSize:13}}>{r.whatsapp}</span>:<span style={{color:'#DDD'}}>-</span>}</td><td style={{padding:'6px 10px'}}>{multi?<Badge label="Multi" color={C.teal} bg={'#E0F2F1'}/>:<Badge label={r.ligacao>0?'Ligacao':r.whatsapp>0?'WhatsApp':'E-mail'} color={r.ligacao>0?C.orange:r.whatsapp>0?'#AAA':'#444'} bg={r.ligacao>0?C.oL:r.whatsapp>0?C.grayL:'#EBEBEB'}/>}</td></tr>);})}</tbody></table></div></Card>
        </div>)}
        {subSDR==='agendamentos'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
          <div style={{display:'flex',gap:9}}><KPICard title="Total Movs." value={totalMov} icon="🔄" note={movFilt.length+' dias'}/><KPICard title="Media/Dia" value={mediaMov} icon="📈" note={'Meta: '+META_DIA+'/dia'}/><KPICard title="Agendamentos" value={totalAgend} icon="📅" note={'Meta: '+META_AGEND_MES}/><KPICard title="Conversao" value={txConv+'%'} icon="🎯" note={totalReal+' realizadas'}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:11}}>
            <Card title="Status dos Agendamentos">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{label:'Total',value:totalAgend},{label:'Realizadas',value:totalReal},{label:'Agendadas',value:totalAgend-totalReal}]} margin={{top:20,right:20,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:11,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="value" name="Qtd." radius={[5,5,0,0]} barSize={52}>{[C.orange,C.green,C.gray].map((f,i)=>(<Cell key={i} fill={f}/>))}<LabelList dataKey="value" position="top" style={{fontSize:13,fontWeight:700}}/></Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Movimentacoes por Dia">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={movFilt} margin={{top:20,right:20,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
                  <XAxis dataKey="dia" tick={{fontSize:11,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} domain={[0,'dataMax+5']}/>
                  <Tooltip content={<Tip/>}/>
                  <ReferenceLine y={META_DIA} stroke={C.green} strokeWidth={1.5} strokeDasharray="5 3" label={{value:'Meta 25',fill:C.green,fontSize:10,position:'insideTopRight',fontWeight:700}}/>
                  <Bar dataKey="mov" name="Movimentacoes" radius={[5,5,0,0]} barSize={36}>{movFilt.map((d,i)=>(<Cell key={i} fill={d.mov>=25?'#2E7D32':d.mov>=11?'#F59E0B':d.mov>0?'#C62828':'#DDDDDD'}/>))}<LabelList dataKey="mov" position="top" style={{fontSize:11,fontWeight:800}}/></Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:'flex',gap:12,marginTop:10,flexWrap:'wrap',alignItems:'center'}}>
                <span style={{fontSize:10,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em'}}>Legenda:</span>
                {[{cor:'#C62828',bg:'#FFEBEE',label:'0–10',desc:'Abaixo do esperado'},{cor:'#F59E0B',bg:'#FFFBEB',label:'11–24',desc:'Em progresso'},{cor:'#2E7D32',bg:'#E8F5E9',label:'≥25',desc:'Meta atingida'}].map(f=>(<div key={f.label} style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:12,height:12,borderRadius:3,background:f.cor,flexShrink:0}}/><span style={{fontSize:10,fontWeight:700,color:f.cor,background:f.bg,padding:'1px 6px',borderRadius:4}}>{f.label}</span><span style={{fontSize:10,color:'#666'}}>{f.desc}</span></div>))}
              </div>
              {(()=>{const META_MES=500;const atual=movFilt.reduce((a,d)=>a+d.mov,0);const pct=Math.min(Math.round(atual/META_MES*100),100);const faltam=Math.max(0,META_MES-atual);return(<div style={{marginTop:10,padding:'12px 14px',background:C.grayL,borderRadius:8}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><span style={{fontSize:11,fontWeight:700,color:C.text}}>Meta Mensal de Contatos (Mar/26)</span><div style={{display:'flex',gap:10,alignItems:'center'}}><span style={{fontSize:12,fontWeight:600,color:C.orange}}>{atual}</span><span style={{fontSize:11,color:C.gray}}>/ {META_MES}</span><span style={{fontSize:11,fontWeight:700,color:pct>=100?C.green:C.gray}}>{pct}%</span></div></div><div style={{height:10,background:C.border,borderRadius:6,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:pct>=100?C.green:C.orange,borderRadius:6}}/></div><div style={{display:'flex',justifyContent:'space-between',marginTop:5}}><span style={{fontSize:10,color:C.gray}}>125 interacoes/semana - 25/dia</span><span style={{fontSize:10,color:faltam>0?C.red:C.green,fontWeight:600}}>{faltam>0?'Faltam '+faltam+' contatos':'Meta atingida!'}</span></div></div>);})()}
            </Card>
          </div>
          <Card title={"Agendamentos Marco - "+SDR_AGENDAMENTOS.length}><div style={{overflowX:'auto',borderRadius:5,border:`1px solid ${C.border}`}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:FONT}}><thead><tr style={{background:C.orange}}><th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center',width:36}}>#</th><th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'left'}}>Empresa</th><th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Tamanho</th><th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Status</th><th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>CRM</th><th style={{padding:'9px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Motivo de Perda</th></tr></thead><tbody>{SDR_AGENDAMENTOS.map((d,i)=>{const isReal=d.status===STATUS_REALIZADA;const stColor=isReal?C.green:C.orange;const stBg=isReal?C.gL:C.oL;const stLabel=isReal?'Reuniao Realizada':'Reuniao Agendada';const crmColor=d.crm==='Perdida'?C.red:isReal?C.green:C.orange;const crmBg=d.crm==='Perdida'?C.rL:isReal?C.gL:C.oL;return(<tr key={i} style={{...tRow(i),fontSize:12}}><td style={{padding:'9px 12px',color:C.gray,fontWeight:700,textAlign:'center'}}>{i+1}</td><td style={{padding:'9px 12px',fontWeight:700,color:C.text}}>{d.empresa}</td><td style={{padding:'9px 12px',textAlign:'center'}}><Badge label={d.perfil} color={d.perfil==='ETP'?C.blue:C.orange} bg={d.perfil==='ETP'?C.bL:C.oL}/></td><td style={{padding:'9px 12px',textAlign:'center'}}><Badge label={stLabel} color={stColor} bg={stBg}/></td><td style={{padding:'9px 12px',textAlign:'center'}}><div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'center'}}><Badge label={d.crm} color={crmColor} bg={crmBg}/>{d.etapaCrm&&<Badge label={d.etapaCrm} color={C.blue} bg={C.bL}/>}</div></td><td style={{padding:'9px 12px',textAlign:'center'}}>{d.motivo?<Badge label={d.motivo} color={C.red} bg={C.rL}/>:<span style={{color:C.gray}}>-</span>}</td></tr>);})}</tbody></table></div><div style={{marginTop:12}}><PBar label={'Meta mensal ('+META_AGEND_MES+')'} actual={totalAgend} meta={META_AGEND_MES}/></div></Card>
        </div>)}
        {subSDR==='bonificacao'&&(<div style={{display:'flex',flexDirection:'column',gap:11}}>
          <Card title="Bonificacao por Agendamentos - Marco/2026"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><div style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8}}>Tabela de Faixas</div><div style={{borderRadius:6,overflow:'hidden',border:`1px solid ${C.border}`}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11,fontFamily:FONT}}><thead><tr style={{background:C.orange}}><th style={{padding:'8px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Volume</th><th style={{padding:'8px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>R$/Reuniao</th><th style={{padding:'8px 12px',color:C.white,fontWeight:700,fontSize:10,textTransform:'uppercase',textAlign:'center'}}>Cenario</th></tr></thead><tbody>{BONIF.map((b,i)=>{const ativa=faixa&&faixa.min===b.min;return(<tr key={i} style={{background:ativa?C.oL:i%2===0?C.white:C.grayL,borderBottom:`1px solid ${C.border}`,fontWeight:ativa?700:400}}><td style={{padding:'9px 12px',color:ativa?C.orange:C.text,textAlign:'center'}}>{b.min}-{b.max}</td><td style={{padding:'9px 12px',textAlign:'center',color:ativa?C.orange:C.text}}>R$ {b.valor},00</td><td style={{padding:'9px 12px',textAlign:'center',color:ativa?C.orange:C.text}}>R$ {b.cenario.toLocaleString('pt-BR')}</td></tr>);})}</tbody></table></div></div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><div style={{background:C.oL,borderRadius:8,padding:'12px 14px',textAlign:'center',border:`1.5px solid ${C.orange}`}}><div style={{fontSize:10,color:C.gray,textTransform:'uppercase',fontWeight:700,marginBottom:4}}>Agendamentos</div><div style={{fontSize:24,fontWeight:600,color:C.orange}}>{totalAgend}</div></div><div style={{background:C.gL,borderRadius:8,padding:'12px 14px',textAlign:'center',border:`1.5px solid ${C.green}`}}><div style={{fontSize:10,color:C.gray,textTransform:'uppercase',fontWeight:700,marginBottom:4}}>Bonif. Atual</div><div style={{fontSize:20,fontWeight:600,color:C.green}}>R$ {bonifAtual.toLocaleString('pt-BR')}</div></div></div>
              {faixa&&<div><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,fontWeight:600}}>Progresso ({faixa.min}-{faixa.max})</span><span style={{fontSize:11,color:C.gray}}><strong style={{color:C.orange}}>{totalAgend}</strong>/{faixa.max}</span></div><div style={{height:10,background:C.grayL,borderRadius:5,overflow:'hidden'}}><div style={{height:'100%',width:`${pctFaixa}%`,background:C.orange,borderRadius:5}}/></div></div>}
              {proxFaixa&&faltamProx>0&&<div style={{background:C.grayL,borderRadius:8,padding:'10px 14px'}}><div style={{fontSize:10,color:C.gray,textTransform:'uppercase',fontWeight:700,marginBottom:4}}>Proxima Faixa</div><div style={{fontSize:12,color:C.text}}>Faltam <strong style={{color:C.orange}}>{faltamProx}</strong> para R$ {proxFaixa.valor},00/reuniao</div></div>}
            </div>
          </div></Card>
        </div>)}
      </div>
    </div>
  </div>);
}

function OverviewPage(){
  const[data,setData]=useState([]);
  const[loading,setLoading]=useState(true);
  const[fetchErr,setFetchErr]=useState(null);
  useEffect(()=>{
    fetch('/api/crm')
      .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();})
      .then(d=>{setData(d);setLoading(false);})
      .catch(e=>{setFetchErr(e.message);setLoading(false);});
  },[]);

  const nTotal=data.length;
  const vendidas=data.filter(r=>r[F.ESTADO]==='Vendida');
  const perdidas=data.filter(r=>r[F.ESTADO]==='Perdida');
  const ativos=data.filter(r=>r[F.ESTADO]==='Em Andamento');
  const nVend=vendidas.length,nPerd=perdidas.length,nAtivo=ativos.length;
  const winRate=(nVend+nPerd)>0?Math.round(nVend/(nVend+nPerd)*100):0;
  const YTD='2026-01-01';
  const vendYTD=vendidas.filter(r=>r[F.DFECH]&&r[F.DFECH]>=YTD);
  const nVendYTD=vendYTD.length;
  const META_ANUAL=40;
  const diasYTD=Math.floor((new Date()-new Date(YTD))/864e5);
  const paceAnual=diasYTD>0?Math.round(nVendYTD/diasYTD*365):0;
  const cycles=vendidas.filter(r=>r[F.DPRIMEIRO]&&r[F.DFECH]).map(r=>Math.floor((new Date(r[F.DFECH])-new Date(r[F.DPRIMEIRO]))/864e5));
  const avgCycle=cycles.length>0?Math.round(cycles.reduce((a,b)=>a+b,0)/cycles.length):null;
  const ETAPA_LBL=e=>e==='Solicitacao de Documentos'?'Sol. Docs':e;
  const funnelData=nTotal>0?ETAPA_ORDER.map((etapa,i)=>{const n=data.filter(r=>ETAPA_ORDER.indexOf(r[F.ETAPA])>=i).length;return{etapa:ETAPA_LBL(etapa),count:n,pct:Math.round(n/nTotal*100);};}):[];
  const lossM={};perdidas.forEach(r=>{const m=r[F.MOTIVO]||'Não informado';lossM[m]=(lossM[m]||0)+1;});
  const lossData=Object.entries(lossM).sort((a,b)=>b[1]-a[1]).map(([motivo,count])=>({motivo,count}));
  const lossSM={};perdidas.forEach(r=>{const s=r[F.ETAPA];lossSM[s]=(lossSM[s]||0)+1;});
  const lossStage=ETAPA_ORDER.filter(e=>lossSM[e]).map(e=>({etapa:ETAPA_LBL(e),count:lossSM[e]}));
  const byPerfil=['ETP','PME'].map(p=>{const d=data.filter(r=>r[F.PERFIL]===p);const v=d.filter(r=>r[F.ESTADO]==='Vendida').length;const per=d.filter(r=>r[F.ESTADO]==='Perdida').length;const a=d.filter(r=>r[F.ESTADO]==='Em Andamento').length;return{perfil:p,total:d.length,ativos:a,vendidas:v,perdidas:per,winRate:(v+per)>0?Math.round(v/(v+per)*100):0};});
  const execMap={};data.forEach(r=>{const n=r[F.RESP]||'—';if(!execMap[n])execMap[n]={nome:n,ativos:0,vendidas:0,perdidas:0,total:0};execMap[n].total++;if(r[F.ESTADO]==='Vendida')execMap[n].vendidas++;else if(r[F.ESTADO]==='Perdida')execMap[n].perdidas++;else execMap[n].ativos++;});
  const byExec=Object.values(execMap).map(e=>({...e,winRate:(e.vendidas+e.perdidas)>0?Math.round(e.vendidas/(e.vendidas+e.perdidas)*100):0})).sort((a,b)=>b.total-a.total);
  const contrByMo={},leadsByMo={};
  vendidas.forEach(r=>{if(r[F.DFECH]){const m=r[F.DFECH].slice(0,7);contrByMo[m]=(contrByMo[m]||0)+1;}});
  data.forEach(r=>{if(r[F.DPRIMEIRO]){const m=r[F.DPRIMEIRO].slice(0,7);leadsByMo[m]=(leadsByMo[m]||0)+1;}});
  const allMo=[...new Set([...Object.keys(contrByMo),...Object.keys(leadsByMo)])].sort();
  const timelineData=allMo.map(m=>({mes:MONTHS_LBL[MONTHS_KEY.indexOf(m)]||m,contratos:contrByMo[m]||0,leads:leadsByMo[m]||0}));
  const pipelineData=ETAPA_ORDER.map(e=>({etapa:ETAPA_LBL(e),count:ativos.filter(r=>r[F.ETAPA]===e).length})).filter(d=>d.count>0);
  const hotDeals=[...ativos].sort((a,b)=>ETAPA_ORDER.indexOf(b[F.ETAPA])-ETAPA_ORDER.indexOf(a[F.ETAPA])).slice(0,10);
  const bs=`1px solid ${C.border}`;
  if(loading)return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,gap:12,fontFamily:FONT,color:C.gray}}><div style={{width:22,height:22,border:`3px solid ${C.border}`,borderTopColor:C.orange,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><span style={{fontSize:13}}>Carregando base comercial…</span></div>);
  if(fetchErr)return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,fontFamily:FONT}}><div style={{background:'#FFF5F5',border:'1px solid #FFCCCC',borderRadius:8,padding:'20px 28px',textAlign:'center'}}><div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>Erro ao carregar CRM</div><div style={{fontSize:11,color:C.gray}}>{fetchErr}</div></div></div>);
  return(
    <div style={{display:'flex',flexDirection:'column',gap:11,fontFamily:FONT}}>
      {/* Header */}
      <div style={{background:C.dark,borderRadius:8,padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{color:C.white,fontSize:18,fontWeight:800,letterSpacing:'-0.02em'}}>Overview Comercial</div>
          <div style={{color:'rgba(255,255,255,0.45)',fontSize:11,marginTop:2}}>Base CRM · {nTotal} empresas mapeadas</div>
        </div>
        <div style={{display:'flex',gap:24}}>
          {[{label:'Win Rate',value:winRate+'%',color:winRate>=50?C.green:C.orange},{label:'Contratos YTD',value:nVendYTD,color:C.orange},{label:'Pace Anual',value:paceAnual+'/ano',color:paceAnual>=META_ANUAL?C.green:C.amber},{label:'Meta Anual',value:META_ANUAL+'/ano',color:'rgba(255,255,255,0.4)'}].map(k=>(
            <div key={k.label} style={{textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:k.color,lineHeight:1}}>{k.value}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.07em',marginTop:3}}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:9}}>
        {[
          {title:'Pipeline Total',value:nTotal,note:'empresas no CRM',color:C.text},
          {title:'Em Andamento',value:nAtivo,note:`${Math.round(nAtivo/nTotal*100)}% do total`,color:C.orange},
          {title:'Contratos Fechados',value:nVend,note:`${nVendYTD} fechados em 2026`,color:C.green},
          {title:'Perdidos',value:nPerd,note:`${Math.round(nPerd/nTotal*100)}% do total`,color:C.red},
          {title:'Ciclo Médio',value:avgCycle?avgCycle+'d':'—',note:'1º contato → fechamento',color:C.blue},
        ].map(k=>(
          <div key={k.title} style={{background:C.white,borderRadius:8,padding:'14px 16px',border:bs,boxShadow:C.shadow,textAlign:'center'}}>
            <div style={{fontSize:9,color:C.gray,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>{k.title}</div>
            <div style={{fontSize:30,fontWeight:800,color:k.color,lineHeight:1}}>{k.value}</div>
            <div style={{fontSize:10,color:C.gray,marginTop:5}}>{k.note}</div>
          </div>
        ))}
      </div>
      {/* Funil + Pipeline ativo */}
      <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:11}}>
        <Card title="Funil de Conversão — todos os leads">
          <div style={{paddingTop:4}}>
            {funnelData.map((d,i)=>{
              const prev=i>0?funnelData[i-1].count:d.count;
              const conv=prev>0?Math.round(d.count/prev*100):100;
              const w=Math.max(d.pct,6);
              const isLast=i===funnelData.length-1;
              return(
                <div key={d.etapa} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                  <div style={{width:110,fontSize:10,color:C.text,textAlign:'right',flexShrink:0,fontWeight:isLast?700:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.etapa}</div>
                  <div style={{flex:1,height:20,background:C.grayL,borderRadius:4,overflow:'hidden',position:'relative'}}>
                    <div style={{height:'100%',width:`${w}%`,background:isLast?C.green:C.orange,borderRadius:4,opacity:Math.max(0.35,1-i*0.045)}}/>
                    <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:10,fontWeight:700,color:w>22?C.white:C.text}}>{d.count}</span>
                  </div>
                  <span style={{fontSize:9,color:C.gray,width:34,textAlign:'right',flexShrink:0}}>{d.pct}%</span>
                  {i>0&&conv<100&&<span style={{fontSize:9,color:conv>=75?'#2D9E60':C.amber,width:36,textAlign:'right',flexShrink:0,fontWeight:700}}>↓{conv}%</span>}
                  {i===0&&<span style={{fontSize:9,color:'transparent',width:36,flexShrink:0}}>—</span>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Pipeline Ativo — distribuição por etapa">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={pipelineData} layout="vertical" margin={{top:4,right:36,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false}/>
              <YAxis dataKey="etapa" type="category" tick={{fontSize:9.5,fill:C.gray,fontFamily:FONT}} width={110} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="count" name="Em Andamento" fill={C.orange} radius={[0,4,4,0]} barSize={18}>
                <LabelList dataKey="count" position="right" style={{fontSize:11,fontWeight:800,fill:C.text}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      {/* Win Rate ETP vs PME + Perdas */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
        <Card title="Win Rate por Segmento">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            {byPerfil.map(p=>{
              const col=p.perfil==='ETP'?C.orange:C.blue;
              return(
                <div key={p.perfil} style={{background:C.grayL,borderRadius:8,padding:'14px 16px',textAlign:'center'}}>
                  <div style={{fontSize:11,fontWeight:800,color:col,marginBottom:8}}>{p.perfil}</div>
                  <div style={{fontSize:34,fontWeight:800,color:C.text,lineHeight:1}}>{p.winRate}%</div>
                  <div style={{fontSize:10,color:C.gray,marginTop:3}}>win rate</div>
                  <div style={{marginTop:8,height:6,background:C.border,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${p.winRate}%`,background:col,borderRadius:4}}/></div>
                  <div style={{display:'flex',justifyContent:'space-around',marginTop:10}}>
                    {[{v:p.ativos,l:'Ativos',c:C.orange},{v:p.vendidas,l:'Ganhos',c:C.green},{v:p.perdidas,l:'Perdidos',c:C.red}].map(x=>(
                      <div key={x.l} style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:x.c}}>{x.v}</div><div style={{fontSize:8,color:C.gray,textTransform:'uppercase',marginTop:2}}>{x.l}</div></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:C.oL,borderRadius:8}}>
            <span style={{fontSize:11,color:C.text}}>Win rate geral: <strong style={{color:C.orange,fontSize:15}}>{winRate}%</strong></span>
            <span style={{fontSize:10,color:C.gray,marginLeft:'auto'}}>{nVend} ganhos · {nPerd} perdidos · {nVend+nPerd} encerrados</span>
          </div>
        </Card>
        <Card title="Análise de Perdas">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:C.gray,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10}}>Por Motivo</div>
              {lossData.map((d,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:10,color:C.text}}>{d.motivo}</span><span style={{fontSize:10,fontWeight:700}}>{d.count}</span></div>
                  <div style={{height:5,background:C.grayL,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.round(d.count/nPerd*100)}%`,background:'#4A4B4D',borderRadius:3}}/></div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:C.gray,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10}}>Por Etapa</div>
              {lossStage.map((d,i)=>(
                <div key={i} style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:10,color:C.text}}>{d.etapa}</span><span style={{fontSize:10,fontWeight:700}}>{d.count}</span></div>
                  <div style={{height:5,background:C.grayL,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.round(d.count/nPerd*100)}%`,background:C.red,borderRadius:3}}/></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      {/* Timeline + Exec */}
      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:11}}>
        <Card title="Novos Leads e Contratos por Mês">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={timelineData} margin={{top:20,right:20,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grayL} vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.gray,fontFamily:FONT}} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<Tip/>}/>
              <Legend wrapperStyle={{fontSize:10,fontFamily:FONT}}/>
              <Bar dataKey="leads" name="Novos Leads" fill={C.grayL} stroke={C.border} radius={[3,3,0,0]} barSize={28}>
                <LabelList dataKey="leads" position="top" style={{fontSize:9,fill:C.gray,fontWeight:700}} formatter={v=>v>0?v:''}/>
              </Bar>
              <Line dataKey="contratos" name="Contratos Fechados" stroke={C.green} strokeWidth={2.5} type="monotone" dot={{r:5,fill:C.green,stroke:'#fff',strokeWidth:2}}>
                <LabelList dataKey="contratos" position="top" style={{fontSize:10,fill:C.green,fontWeight:800}} formatter={v=>v>0?v:''}/>
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Performance por Responsável">
          <div style={{overflowX:'auto',borderRadius:6,border:`1px solid ${C.border}`}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <TblHead cols={['Resp.','Total','Ativos','Ganhos','Perdidos','WR']}/>
              <tbody>{byExec.map((e,i)=>{
                const meta=EXEC_METAS.find(m=>m.nome===e.nome);
                const col=meta?meta.color:C.gray;
                return(
                  <tr key={i} style={tRow(i)}>
                    <td style={{padding:'6px 10px'}}><div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:8,height:8,borderRadius:'50%',background:col,flexShrink:0}}/><span style={{fontWeight:700,fontSize:11}}>{e.nome.split(' ')[0]}</span></div></td>
                    <td style={{padding:'6px 8px',fontWeight:800,color:C.text,textAlign:'center'}}>{e.total}</td>
                    <td style={{padding:'6px 8px',color:C.orange,fontWeight:700,textAlign:'center'}}>{e.ativos||'—'}</td>
                    <td style={{padding:'6px 8px',color:C.green,fontWeight:700,textAlign:'center'}}>{e.vendidas||'—'}</td>
                    <td style={{padding:'6px 8px',color:e.perdidas>0?C.red:C.gray,fontWeight:700,textAlign:'center'}}>{e.perdidas||'—'}</td>
                    <td style={{padding:'6px 8px',textAlign:'center'}}>
                      {(e.vendidas+e.perdidas)>0?<span style={{fontSize:10,fontWeight:700,background:e.winRate>=50?C.gL:C.rL,color:e.winRate>=50?C.green:C.red,padding:'2px 7px',borderRadius:10}}>{e.winRate}%</span>:<span style={{color:'#CCC'}}>—</span>}
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Card>
      </div>
      {/* Hot deals */}
      <Card title={`Oportunidades Mais Avançadas — top ${hotDeals.length} deals ativos`}>
        <div style={{overflowX:'auto',borderRadius:6,border:`1px solid ${C.border}`}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <TblHead cols={['Empresa','Responsável','Perfil','Etapa','Último Contato','Aging']}/>
            <tbody>{hotDeals.map((r,i)=>{
              const aging=r[F.DPRIMEIRO]?Math.floor((new Date()-new Date(r[F.DPRIMEIRO]))/864e5):null;
              const meta=EXEC_METAS.find(m=>m.nome===r[F.RESP]);
              const col=meta?meta.color:C.gray;
              const lastContact=r[F.DREUNIAO]||r[F.DPRIMEIRO];
              return(
                <tr key={i} style={tRow(i)}>
                  <td style={{padding:'7px 10px',fontWeight:700,color:C.text}}>{r[F.NOME]}</td>
                  <td style={{padding:'7px 10px'}}><div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:7,height:7,borderRadius:'50%',background:col}}/><span style={{fontSize:10.5}}>{(r[F.RESP]||'—').split(' ')[0]}</span></div></td>
                  <td style={{padding:'7px 10px'}}><span style={{fontSize:10,fontWeight:700,background:r[F.PERFIL]==='ETP'?C.oL:C.bL,color:r[F.PERFIL]==='ETP'?C.orange:C.blue,padding:'1px 6px',borderRadius:4}}>{r[F.PERFIL]}</span></td>
                  <td style={{padding:'7px 10px'}}><Badge label={ETAPA_LBL(r[F.ETAPA])} color={C.orange}/></td>
                  <td style={{padding:'7px 10px',color:C.gray,fontSize:10.5}}>{fmtDt(lastContact)}</td>
                  <td style={{padding:'7px 10px'}}>
                    {aging!==null?<span style={{fontSize:10,fontWeight:700,background:aging<=90?C.gL:aging<=180?C.oL:C.rL,color:aging<=90?C.green:aging<=180?C.orange:C.red,padding:'2px 7px',borderRadius:10}}>{aging}d</span>:<span style={{color:'#CCC'}}>—</span>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const TABS=[{id:'overview',label:'Overview'},{id:'acomp',label:'Executivos Externos'},{id:'interno',label:'Executivos Internos'},{id:'sdr',label:'SDR'},{id:'diag',label:'Diagnostico'},{id:'parcerias',label:'Parcerias'}];

export default function App(){
  const[tab,setTab]=useState('acomp');
  const[selPerfil,setSelPerfil]=useState('Todos');
  const[dateIni,setDateIni]=useState('');
  const[dateFim,setDateFim]=useState('');
  const hasFilter=dateIni||dateFim;
  const FL=useMemo(()=>{let d=RAW;if(hasFilter){d=d.filter(r=>{const datas=[r[F.DPRIMEIRO],r[F.DREUNIAO],r[F.DFECH]].filter(Boolean);return datas.some(dt=>inRange(dt,dateIni,dateFim));});}if(selPerfil!=='Todos')d=d.filter(r=>r[F.PERFIL]===selPerfil);return d;},[dateIni,dateFim,selPerfil]);
  const inputStyle={padding:'5px 10px',borderRadius:6,border:`1.5px solid ${C.border}`,fontSize:11,fontFamily:FONT,outline:'none',color:C.text,background:C.white,cursor:'pointer'};
  return(<div style={{minHeight:'100vh',background:C.grayL,fontFamily:FONT}}>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>{`* { font-family: 'Noto Sans', system-ui, sans-serif !important; }`}</style>
    <div style={{background:C.dark,padding:'0 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:1400,margin:'0 auto',height:52}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}><div style={{width:30,height:30,borderRadius:6,background:C.orange,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:C.white}}>R</div><span style={{color:C.white,fontWeight:600,fontSize:15}}>Rumo Brasil</span><span style={{color:'rgba(255,255,255,0.25)',fontSize:13}}>|</span><span style={{color:'rgba(255,255,255,0.45)',fontSize:12}}>Dashboard Comercial</span></div>
        <span style={{color:'rgba(255,255,255,0.5)',fontSize:11}}></span>
      </div>
    </div>
    <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,boxShadow:C.shadow}}>
      <div style={{display:'flex',maxWidth:1400,margin:'0 auto',padding:'0 20px',gap:2,overflowX:'auto'}}>
        {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'11px 20px',border:'none',background:'none',cursor:'pointer',fontWeight:tab===t.id?700:500,fontSize:13,color:tab===t.id?C.orange:C.gray,borderBottom:tab===t.id?`2.5px solid ${C.orange}`:'2.5px solid transparent',whiteSpace:'nowrap',fontFamily:FONT}}>{t.label}</button>))}
      </div>
    </div>
    <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'10px 20px'}}>
      <div style={{maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase',whiteSpace:'nowrap'}}>De</span><input type="date" value={dateIni} onChange={e=>setDateIni(e.target.value)} style={inputStyle}/><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase',whiteSpace:'nowrap'}}>Ate</span><input type="date" value={dateFim} onChange={e=>setDateFim(e.target.value)} style={inputStyle}/>{hasFilter&&(<button onClick={()=>{setDateIni('');setDateFim('');}} style={{padding:'5px 12px',borderRadius:6,border:`1.5px solid ${C.red}`,background:C.rL,color:C.red,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>X Limpar</button>)}</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:10,fontWeight:700,color:C.gray,textTransform:'uppercase',whiteSpace:'nowrap'}}>Perfil</span><select value={selPerfil} onChange={e=>setSelPerfil(e.target.value)} style={{...inputStyle,minWidth:110}}><option value="Todos">Todos</option><option value="ETP">ETP</option><option value="PME">PME</option></select></div>
      </div>
    </div>
    <div style={{maxWidth:1400,margin:'0 auto',padding:'16px 20px'}}>
      {tab==='overview'&&<OverviewPage/>}
      {tab==='acomp'&&<AcompPage FL={FL}/>}
      {tab==='interno'&&<InternoPage/>}
      {tab==='sdr'&&<SDRPage dateIni={dateIni} dateFim={dateFim}/>}
      {tab==='diag'&&<DiagPage/>}
      {tab==='parcerias'&&<ParceriasPage/>}
    </div>
  </div>);
}