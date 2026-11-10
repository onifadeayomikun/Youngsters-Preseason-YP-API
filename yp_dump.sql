--
-- PostgreSQL database dump
--

\restrict CB4rm8wILEt0FI0WahlYvL4GsOxgPVlBbfF4j9T1HsIoGb5kvuEHpRy71CuaoTG

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clubs (
    club_id integer NOT NULL,
    name character varying(100) NOT NULL,
    slang character varying(100),
    country character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    seasons_available integer DEFAULT 0 NOT NULL,
    country_code character varying(9),
    CONSTRAINT clubs_seasons_available_check CHECK ((seasons_available >= 0))
);


--
-- Name: clubs_club_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clubs_club_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clubs_club_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clubs_club_id_seq OWNED BY public.clubs.club_id;


--
-- Name: player_season_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_season_stats (
    stat_id integer NOT NULL,
    club_id integer NOT NULL,
    season_id integer NOT NULL,
    player_id integer NOT NULL,
    age integer,
    appearances integer DEFAULT 0,
    CONSTRAINT player_season_stats_age_check CHECK (((age > 0) AND (age <= 100))),
    CONSTRAINT player_season_stats_appearances_check CHECK ((appearances >= 0))
);


--
-- Name: player_season_stats_stat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.player_season_stats_stat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: player_season_stats_stat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.player_season_stats_stat_id_seq OWNED BY public.player_season_stats.stat_id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    player_id integer NOT NULL,
    player_name character varying(150) NOT NULL,
    normalized_name text GENERATED ALWAYS AS (lower(TRIM(BOTH FROM player_name))) STORED,
    nationality character varying(100),
    "position" character varying(50)
);


--
-- Name: players_player_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.players_player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: players_player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.players_player_id_seq OWNED BY public.players.player_id;


--
-- Name: preseason_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preseason_data (
    club_id integer NOT NULL,
    season_id integer NOT NULL,
    country_name character varying(60) NOT NULL,
    country_code character varying(40) NOT NULL,
    notes character varying(200)
);


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasons (
    season_id integer NOT NULL,
    season_label character varying(9) NOT NULL
);


--
-- Name: seasons_season_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seasons_season_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seasons_season_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seasons_season_id_seq OWNED BY public.seasons.season_id;


--
-- Name: clubs club_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs ALTER COLUMN club_id SET DEFAULT nextval('public.clubs_club_id_seq'::regclass);


--
-- Name: player_season_stats stat_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_season_stats ALTER COLUMN stat_id SET DEFAULT nextval('public.player_season_stats_stat_id_seq'::regclass);


--
-- Name: players player_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players ALTER COLUMN player_id SET DEFAULT nextval('public.players_player_id_seq'::regclass);


--
-- Name: seasons season_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons ALTER COLUMN season_id SET DEFAULT nextval('public.seasons_season_id_seq'::regclass);


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clubs (club_id, name, slang, country, city, seasons_available, country_code) FROM stdin;
10	Test	Test	Test	Test	1	\N
1	Arsenal	Gunners	England	London	3	GB-ENG
2	Chelsea	Blues	England	London	3	GB-ENG
3	Liverpool	The Reds	England	Liverpool	3	GB-ENG
4	Manchester City	Citizens	England	Manchester City	3	GB-ENG
5	Manchester United	Red Devils	England	Manchester City	3	GB-ENG
6	Tottenham Hotspur	Spurs	England	London	3	GB-ENG
\.


--
-- Data for Name: player_season_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.player_season_stats (stat_id, club_id, season_id, player_id, age, appearances) FROM stdin;
130	1	32	1009	18	0
131	1	32	1045	21	66
132	1	32	1077	21	6
133	1	32	1099	20	56
134	1	33	1004	18	0
135	1	33	1015	17	0
136	1	33	1025	19	3
137	1	33	1039	17	2
138	1	33	1067	19	0
139	1	33	1072	17	0
140	1	33	1091	18	0
141	1	33	1105	18	0
142	1	33	1108	17	0
143	1	33	1124	20	19
144	1	33	1133	18	0
145	2	32	1006	20	0
146	2	32	1010	19	38
147	2	32	1016	20	14
148	2	32	1023	19	31
149	2	32	1024	20	15
150	2	32	1034	18	27
151	2	32	1037	19	21
152	2	32	1046	19	34
153	2	32	1056	21	113
154	2	32	1084	20	54
155	2	32	1085	18	12
156	2	32	1089	20	28
157	2	32	1096	20	61
158	2	32	1100	19	23
159	2	32	1111	21	92
160	2	32	1146	18	97
161	2	33	1010	20	\N
162	2	33	1023	20	\N
163	2	33	1070	18	1
164	2	33	1083	20	\N
165	2	33	1084	21	\N
166	2	33	1096	21	\N
167	2	33	1097	18	20
168	2	33	1120	20	\N
170	2	33	1146	19	\N
171	2	34	1001	20	24
172	2	34	1010	21	100
173	2	34	1036	20	69
174	2	34	1038	18	62
175	2	34	1046	21	34
176	2	34	1047	18	2
177	2	34	1065	20	107
178	2	34	1069	19	111
179	2	34	1070	19	14
180	2	34	1119	16	2
182	3	32	1017	17	7
183	3	32	1019	18	2
184	3	32	1022	18	0
185	3	32	1028	19	54
186	3	32	1042	19	0
187	3	32	1062	18	0
188	3	32	1066	20	15
189	3	32	1086	17	0
190	3	32	1098	20	17
191	3	32	1103	19	2
192	3	32	1128	18	19
193	3	32	1139	21	67
194	3	33	1008	17	0
195	3	33	1017	18	12
196	3	33	1028	20	77
197	3	33	1043	21	96
198	3	33	1051	20	1
199	3	33	1052	20	32
200	3	33	1053	21	164
201	3	33	1062	19	7
202	3	33	1066	21	46
203	3	33	1076	19	7
204	3	33	1086	18	1
205	3	33	1088	20	30
206	3	33	1093	20	38
207	3	33	1098	21	17
208	3	33	1113	21	32
209	3	33	1128	19	22
210	3	33	1134	17	1
211	3	33	1136	21	96
212	3	34	1013	20	69
213	3	34	1017	19	36
214	3	34	1028	21	104
215	3	34	1079	18	0
216	3	34	1088	21	68
217	3	34	1107	21	\N
218	3	34	1123	16	1
219	3	34	1134	18	6
220	4	32	1027	21	36
221	4	32	1061	20	\N
222	4	32	1109	20	\N
223	4	32	1112	19	0
224	4	32	1122	18	\N
225	4	33	1020	20	\N
226	4	33	1055	\N	0
227	4	33	1058	18	0
228	4	33	1059	19	\N
229	4	33	1060	18	0
230	4	33	1061	21	\N
231	4	33	1068	18	0
232	4	33	1073	21	\N
233	4	33	1075	17	0
234	4	33	1081	18	0
235	4	33	1094	20	\N
236	4	33	1095	19	0
237	4	33	1104	20	\N
238	4	33	1109	21	\N
239	4	33	1110	19	0
240	4	33	1112	21	26
241	4	33	1122	19	\N
242	4	33	1129	16	0
243	4	33	1132	\N	0
244	4	34	1002	21	\N
245	4	34	1035	17	0
246	4	34	1110	20	\N
247	4	34	1112	21	\N
248	4	34	1117	21	\N
249	4	34	1122	20	\N
250	4	34	1127	21	\N
251	5	32	1007	20	68
252	5	32	1011	21	\N
253	5	32	1029	18	0
254	5	32	1044	21	\N
255	5	32	1049	20	\N
256	5	32	1115	19	0
327	1	34	1039	18	39
328	1	34	1108	18	39
329	1	34	1133	19	1
330	1	34	1149	19	1
331	1	34	1072	18	1
332	1	34	1150	19	1
333	1	34	1151	17	0
334	1	34	1152	15	0
335	1	34	1153	15	0
336	1	34	1154	18	0
325	1	34	1148	20	90
257	5	32	1145	20	\N
258	5	33	1007	21	74
259	5	33	1031	21	\N
260	5	33	1040	18	1
261	5	33	1049	21	52
262	5	33	1050	17	0
263	5	33	1057	17	0
264	5	33	1063	17	0
265	5	33	1082	18	60
266	5	33	1102	19	\N
267	5	33	1116	21	\N
268	5	33	1121	20	\N
269	5	33	1125	19	\N
270	5	33	1126	19	\N
271	5	33	1131	20	0
272	5	33	1140	21	58
273	5	34	1015	18	\N
274	5	34	1018	17	0
275	5	34	1026	17	8
276	5	34	1033	18	\N
277	5	34	1041	19	17
278	5	34	1057	18	0
279	5	34	1078	20	\N
280	5	34	1082	19	84
281	5	34	1118	18	0
282	5	34	1130	19	0
283	5	34	1131	21	13
284	5	34	1135	20	0
285	5	34	1142	18	0
286	6	32	1005	18	2
287	6	32	1030	19	50
288	6	32	1032	20	77
289	6	32	1054	21	40
290	6	32	1071	20	1
291	6	32	1114	20	66
292	6	33	1003	20	\N
293	6	33	1005	19	\N
294	6	33	1012	18	52
295	6	33	1014	18	\N
296	6	33	1030	20	\N
297	6	33	1048	18	0
298	6	33	1064	19	4
299	6	33	1087	18	0
300	6	33	1090	18	42
301	6	33	1106	16	1
302	6	33	1137	18	0
303	6	33	1141	19	0
304	6	34	1005	20	76
305	6	34	1012	19	98
306	6	34	1014	20	87
307	6	34	1021	18	0
308	6	34	1030	21	96
309	6	34	1048	19	0
310	6	34	1064	20	8
311	6	34	1074	16	0
312	6	34	1080	20	81
313	6	34	1087	19	0
314	6	34	1090	19	89
315	6	34	1092	18	51
316	6	34	1101	20	103
317	6	34	1106	17	19
318	6	34	1137	19	0
319	6	34	1141	20	17
320	6	34	1143	20	55
321	6	34	1144	19	42
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.players (player_id, player_name, nationality, "position") FROM stdin;
1155	Test	Test	Test
1002	Abdukodir Khusanov	Uzbekistan	Defender
1007	Amad Diallo	Ivory Coast	Forward
1009	Amario Cozier-Duberry	England	Forward
1010	Andrey Santos	Brazil	Midfielder
1011	Anthony Elanga	Sweden	Forward
1012	Archie Gray	England	Midfielder
1015	Ayden Heaven	England	Defender
1023	Carney Chukwuemeka	Austria	Midfielder
1026	Chido Obi	Denmark	Forward
1027	Cole Palmer	England	Forward
1038	Estevao Willian	Brazil	Forward
1045	Folarin Balogun	USA	Forward
1039	Ethan Nwaneri	England	Midfielder
1148	Cristhian Mosquera	Spain	Defender
1149	Alexei Rojas-Fedorushchenko	Colombia	Goalkeeper
1150	Ismeal Kabia	England	Forward
1151	Andre Harriman-Annous	England	Forward
1001	Aarón Anselmino	Argentina	\N
1003	Alejo Veliz	Argentina	\N
1004	Alexei Rojas	England	\N
1005	Alfie Devine	England	\N
1006	Alfie Gilchrist	England	\N
1008	Amara Nallo	England	\N
1013	Armin Pecsi	Hungary	\N
1014	Ashley Phillips	England	\N
1016	Bashir Humphreys	England	\N
1017	Ben Doak	Scotland	\N
1018	Bendito Mantato	DR Congo	\N
1019	Bobby Clark	England	\N
1020	Callum Doyle	England	\N
1021	Callum Olusesi	England	\N
1022	Calum Scanlon	Wales	\N
1024	Cesare Casadei	Italy	\N
1025	Charles Sagoe Jr	England	\N
1028	Conor Bradley	Northern Ireland	\N
1029	Dan Gore	England	\N
1030	Dane Scarlett	England	\N
1031	Dermot Mee	England	\N
1032	Destiny Udogie	Italy	\N
1033	Diego León	Paraguay	\N
1034	Diego Moreira	Portugal	\N
1035	Divine Mukasa	England	\N
1036	Dário Essugo	Portugal	\N
1037	Eddie Beach	England	\N
1040	Ethan Wheatley	England	\N
1041	Ethan Williams	England	\N
1042	Fabian Mrozek	Poland	\N
1043	Fabio Carvalho	Portugal	\N
1044	Facundo Pellistri	Uruguay	\N
1046	Gabriel Slonina	USA	\N
1047	Genesis Antwi	England	\N
1048	George Abbott	England	\N
1049	Hannibal Mejbri	Tunisia	\N
1050	Harry Amass	England	\N
1051	Harvey Blair	England	\N
1052	Harvey Davies	England	\N
1053	Harvey Elliott	England	\N
1054	Harvey White	England	\N
1055	Heskey (Jaden or Reigan)	England	\N
1056	Ian Maatsen	Netherlands	\N
1057	Jack Fletcher	England	\N
1058	Jacob Wright	England	\N
1059	Jadel Katongo	England	\N
1060	Jahmai Simpson-Pusey	England	\N
1061	James McAtee	England	\N
1062	James McConnell	England	\N
1063	James Scanlon	England	\N
1064	Jamie Donley	Northern Ireland	\N
1065	Jamie Gittens	England	\N
1066	Jarell Quansah	England	\N
1067	Jimi Gower	England	\N
1068	Joel Ndala	England	\N
1069	Jorrel Hato	Netherlands	\N
1070	Josh Acheampong	England	\N
1071	Josh Keeley	Ireland	\N
1072	Josh Nichols	England	\N
1073	Josh Wilson-Esbrand	England	\N
1074	Jun'ai Byfield	England	\N
1075	Justin Oboavwoduo	England	\N
1076	Kaide Gordon	England	\N
1077	Karl Hein	Estonia	\N
1078	Kobbie Mainoo	England	\N
1079	Kornel Misciur	Poland	\N
1080	Kota Takai	Japan	\N
1081	Lakyle Samuel	England	\N
1082	Leny Yoro	France	\N
1083	Lesley Ugochukwu	France	\N
1084	Levi Colwill	England	\N
1085	Lewis Hall	England	\N
1152	Marli Salmon	England	Defender
1153	Max Dowman	England	Forward
1154	Louie Copley	England	Midfielder
1086	Lewis Koumas	Wales	\N
1087	Luca Gunter	England	\N
1088	Luca Stephenson	England	\N
1089	Lucas Bergstrom	Finland	\N
1090	Lucas Bergvall	Sweden	\N
1091	Lucas Nygaard	Denmark	\N
1092	Luka Vuskovic	Croatia	\N
1093	Luke Chambers	England	\N
1094	Luke Mbete	England	\N
1095	Mahamadou Susoho	France	\N
1096	Malo Gusto	France	\N
1097	Marc Guiu	Spain	\N
1098	Marcelo Pitaluga	Brazil	\N
1099	Marquinhos	Brazil	\N
1100	Mason Burstow	England	\N
1101	Mathys Tel	France	\N
1102	Maxi Oyedele	England	\N
1103	Melkamu Frauendorf	Germany	\N
1104	Micah Hamilton	England	\N
1105	Michal Rosiak	Poland	\N
1106	Mikey Moore	England	\N
1107	Milos Kerkez	Hungary	\N
1108	Myles Lewis-Skelly	England	\N
1109	Máximo Perrone	Argentina	\N
1110	Nico O'Reilly	England	\N
1111	Noni Madueke	England	\N
1112	Oscar Bobb	Norway	\N
1113	Owen Beck	Wales	\N
1114	Pape Matar Sarr	Senegal	\N
1115	Radek Vítek	Czech Republic	\N
1116	Rasmus Hojlund	Denmark	\N
1117	Rayan Cherki	France	\N
1118	Reece Munro	Scotland	\N
1119	Reggie Walsh	England	\N
1120	Renato Veiga	Portugal	\N
1121	Rhys Bennett	England	\N
1122	Rico Lewis	England	\N
1123	Rio Ngumoha	England	\N
1124	Salah-Eddine Oulad M'Hand	Morocco	\N
1125	Sam Mather	England	\N
1126	Sam Murray	England	\N
1127	Savinho	Brazil	\N
1128	Stefan Bajcetic	Spain	\N
1129	Stephen Mfuni	England	\N
1130	Sékou Koné	Mali	\N
1131	Toby Collyer	England	\N
1132	Tomas Galvez	England	\N
1133	Tommy Setford	England	\N
1134	Trey Nyoni	England	\N
1135	Tyler Fredricson	England	\N
1136	Tyler Morton	England	\N
1137	Tyrese Hall	England	\N
1139	Vitezslav Jaros	Czech Republic	\N
1140	Will Fish	England	\N
1141	Will Lankshear	England	\N
1142	Will Murdock	England	\N
1143	Wilson Odobert	France	\N
1144	Yang Min-Hyeok	South Korea	\N
1145	Álvaro Fernández (Carreras)	Spain	\N
1146	Ângelo Gabriel	Brazil	\N
\.


--
-- Data for Name: preseason_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.preseason_data (club_id, season_id, country_name, country_code, notes) FROM stdin;
1	32	England, Germany, United States	GB-ENG, DE, US	GB-ENG: Watford (London Colney), Monaco (Emirates); DE: Nurnberg; US: Washington DC, New York, Los Angeles
1	33	England, United States	GB-ENG, US	GB-ENG: Leyton Orient XI, Bayer Leverkusen, Lyon; US: Los Angeles, Philadelphia
1	34	Singapore, Hong Kong, England	SG, HK, GB-ENG	SG: AC Milan, Newcastle; HK: Tottenham at Kai Tak Stadium; GB-ENG: Villarreal, Athletic Club (Emirates Cup)
1	35	England, Spain, Ireland	GB-ENG, ES, IE	GB-ENG: MK Dons, Borussia Dortmund, Como; ES: Girona; IE: Real Betis in Dublin
2	31	United States, Italy	US, IT	US: Las Vegas, Charlotte, Orlando; IT: Udinese
2	32	United States	US	US: Chapel Hill, Philadelphia, Atlanta, Landover, Chicago
2	33	United States, England	US, GB-ENG	US: Santa Clara, Indiana, Atlanta, Columbus, Charlotte; GB-ENG: Inter Milan at Stamford Bridge
2	34	England	GB-ENG	GB-ENG: Bayer Leverkusen, AC Milan at Stamford Bridge (Club World Cup in US excluded)
2	35	Australia, Hong Kong, Indonesia, Malaysia, England	AU, HK, ID, MY, GB-ENG	AU: Sydney: Western Sydney Wanderers, Tottenham; HK: Juventus; ID: Jakarta: AC Milan; MY: Johor: Johor Darul Ta'zim; GB-ENG: Real Sociedad at Stamford Bridge
3	31	Thailand, Singapore, Germany, Austria, England	TH, SG, DE, AT, GB-ENG	TH: Bangkok v Man Utd; SG: v Crystal Palace; DE: RB Leipzig; AT: RB Salzburg; GB-ENG: Strasbourg at Anfield
3	32	Germany, Singapore, England	DE, SG, GB-ENG	DE: Karlsruher, Greuther Furth; SG: Leicester, Bayern Munich; GB-ENG: Darmstadt at Deepdale
3	33	United States, England	US, GB-ENG	US: Real Betis, Arsenal, Man Utd; GB-ENG: Preston, Sevilla at Anfield
3	34	England, Hong Kong, Japan	GB-ENG, HK, JP	GB-ENG: Preston, Stoke, Athletic Club at Anfield; HK: AC Milan at Kai Tak Stadium; JP: Yokohama F. Marinos
3	35	United States, England	US, GB-ENG	US: Nashville, New York, Chicago; GB-ENG: Monaco, Como at Anfield
4	31	United States	US	US: Houston (Club America), Green Bay (Bayern Munich)
4	32	Japan, South Korea	JP, KR	JP: Tokyo: Yokohama F. Marinos, Bayern Munich; KR: Seoul: Atletico Madrid
4	33	United States	US	US: Chapel Hill, New York, Orlando, Columbus
4	34	Italy	IT	IT: Palermo (Club World Cup in US excluded)
4	35	Hong Kong, South Korea	HK, KR	HK: Inter Milan; KR: Seoul: K-League All Stars, Atletico Madrid
5	31	Thailand, Australia, Norway, England	TH, AU, NO, GB-ENG	TH: Bangkok v Liverpool; AU: Melbourne, Perth; NO: Oslo v Atletico Madrid; GB-ENG: Rayo Vallecano at Old Trafford
5	32	Norway, Scotland, United States, Ireland, England	NO, GB-SCT, US, IE, GB-ENG	NO: Oslo v Leeds; GB-SCT: Edinburgh v Lyon; US: Arsenal, Wrexham, Real Madrid, Borussia Dortmund; IE: Dublin v Athletic Club; GB-ENG: Lens at Old Trafford
5	33	Norway, Scotland, United States	NO, GB-SCT, US	NO: Trondheim v Rosenborg; GB-SCT: Murrayfield, Edinburgh v Rangers; US: Los Angeles, San Diego, South Carolina
5	34	Sweden, United States, England, Malaysia, Hong Kong	SE, US, GB-ENG, MY, HK	SE: Stockholm v Leeds; US: PL Summer Series (West Ham, Bournemouth, Everton); GB-ENG: Fiorentina at Old Trafford; MY: Kuala Lumpur v ASEAN All Stars; HK: v Hong Kong XI (MY/HK: May 2025 tour)
5	35	Finland, Norway, Sweden, Ireland, Poland	FI, NO, SE, IE, PL	FI: Helsinki v Wrexham; NO: Trondheim v Rosenborg; SE: Stockholm (Atletico Madrid), Gothenburg (PSG); IE: Dublin v Leeds; PL: Wroclaw v AC Milan
6	31	South Korea, Scotland, Israel	KR, GB-SCT, IL	KR: Seoul (Team K League), Suwon (Sevilla); GB-SCT: Glasgow v Rangers at Ibrox; IL: v Roma
6	32	Australia, Thailand, Singapore, England, Spain	AU, TH, SG, GB-ENG, ES	AU: Perth v West Ham; TH: Bangkok v Leicester; SG: v Lion City Sailors; GB-ENG: Shakhtar Donetsk at Tottenham Hotspur Stadium; ES: Barcelona (Joan Gamper Trophy)
6	33	England, Scotland, Japan, South Korea	GB-ENG, GB-SCT, JP, KR	GB-ENG: Cambridge, QPR, Bayern Munich at Tottenham Hotspur Stadium; GB-SCT: Edinburgh v Hearts at Tynecastle; JP: Tokyo v Vissel Kobe; KR: Seoul: Team K League, Bayern Munich
6	34	England, Hong Kong, South Korea, Germany	GB-ENG, HK, KR, DE	GB-ENG: Reading, Wycombe, Luton; HK: v Arsenal at Kai Tak Stadium; KR: Seoul v Newcastle; DE: Munich v Bayern Munich (UEFA Super Cup in Italy excluded)
6	35	England, New Zealand, Australia	GB-ENG, NZ, AU	GB-ENG: MK Dons, Getafe, Hoffenheim; NZ: Auckland FC; AU: Sydney: Sydney FC, Chelsea
1	31	Germany, United States, England	DE, US, GB-ENG	DE: Nurnberg; US: Baltimore, Orlando (Everton, Orlando City, Chelsea); GB-ENG: Emirates Cup v Sevilla
\.


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seasons (season_id, season_label) FROM stdin;
1	1992-93
2	1993-94
3	1994-95
5	1996-97
6	1997-98
7	1998-99
8	1999-00
9	2000-01
10	2001-02
11	2002-03
12	2003-04
13	2004-05
14	2005-06
15	2006-07
16	2007-08
17	2008-09
18	2009-10
19	2010-11
20	2011-12
21	2012-13
22	2013-14
23	2014-15
24	2015-16
25	2016-17
26	2017-18
27	2018-19
28	2019-20
29	2020-21
30	2021-22
31	2022-23
32	2023-24
33	2024-25
34	2025-26
35	2026-27
\.


--
-- Name: clubs_club_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clubs_club_id_seq', 10, true);


--
-- Name: player_season_stats_stat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.player_season_stats_stat_id_seq', 337, true);


--
-- Name: players_player_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.players_player_id_seq', 1155, true);


--
-- Name: seasons_season_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seasons_season_id_seq', 35, true);


--
-- Name: clubs clubs_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_name_key UNIQUE (name);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (club_id);


--
-- Name: player_season_stats player_season_stats_club_id_season_id_player_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_season_stats
    ADD CONSTRAINT player_season_stats_club_id_season_id_player_id_key UNIQUE (club_id, season_id, player_id);


--
-- Name: player_season_stats player_season_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_season_stats
    ADD CONSTRAINT player_season_stats_pkey PRIMARY KEY (stat_id);


--
-- Name: players players_normalized_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_normalized_name_key UNIQUE (normalized_name);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (player_id);


--
-- Name: preseason_data preseason_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preseason_data
    ADD CONSTRAINT preseason_data_pkey PRIMARY KEY (club_id, season_id, country_code);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (season_id);


--
-- Name: seasons seasons_season_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_season_label_key UNIQUE (season_label);


--
-- Name: player_season_stats player_season_stats_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_season_stats
    ADD CONSTRAINT player_season_stats_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(club_id) ON DELETE CASCADE;


--
-- Name: player_season_stats player_season_stats_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_season_stats
    ADD CONSTRAINT player_season_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(player_id) ON DELETE CASCADE;


--
-- Name: player_season_stats player_season_stats_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_season_stats
    ADD CONSTRAINT player_season_stats_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(season_id) ON DELETE CASCADE;


--
-- Name: preseason_data preseason_data_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preseason_data
    ADD CONSTRAINT preseason_data_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(club_id);


--
-- Name: preseason_data preseason_data_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preseason_data
    ADD CONSTRAINT preseason_data_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(season_id);


--
-- PostgreSQL database dump complete
--

\unrestrict CB4rm8wILEt0FI0WahlYvL4GsOxgPVlBbfF4j9T1HsIoGb5kvuEHpRy71CuaoTG

