--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2 (Debian 14.2-1.pgdg110+1)
-- Dumped by pg_dump version 14.2 (Debian 14.2-1.pgdg110+1)

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
-- Name: sentry_installation; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.sentry_installation (
    id integer NOT NULL,
    uuid character varying(255),
    org_slug character varying(255),
    token character varying(255),
    refresh_token character varying(255),
    expires_at timestamp with time zone,
);


ALTER TABLE public.sentry_installation OWNER TO admin;

--
-- Name: sentry_installation_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.sentry_installation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sentry_installation_id_seq OWNER TO admin;

--
-- Name: sentry_installation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.sentry_installation_id_seq OWNED BY public.sentry_installation.id;

--
-- Name: github_repo; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.github_repo (
    id integer NOT NULL,
    name character varying(255),
    sentry_project_slug character varying(255),
    wait_period_to_check_for_issue integer,
    sentry_installation_id integer,
    user_id integer,
    is_active boolean;
);


ALTER TABLE public.github_repo OWNER TO admin;

--
-- Name: github_repo_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.github_repo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.github_repo_id_seq OWNER TO admin;

--
-- Name: github_repo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.github_repo_id_seq OWNED BY public.github_repo.id;


--
-- Name: deployment_protection_rule_request; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.deployment_protection_rule_request (
    id integer NOT NULL,
    status character varying(255),
    installation_id integer,
    environment character varying(255),
    deployment_callback_url character varying(512),
    sha character varying(512),
    created_at timestamp with time zone,
    github_repo_id integer,
);


ALTER TABLE public.deployment_protection_rule_request OWNER TO admin;

--
-- Name: deployment_protection_rule_request_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.deployment_protection_rule_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.deployment_protection_rule_request_id_seq OWNER TO admin;

--
-- Name: deployment_protection_rule_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.deployment_protection_rule_request_id_seq OWNED BY public.deployment_protection_rule_request.id;



--
-- Name: user; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying(255),
    github_handle character varying(255),
    refresh_token character varying(255),
    username character varying(255),
    sentry_installation_id integer,
    avatar character varying(255),
    organization_id integer
);


ALTER TABLE public."user" OWNER TO admin;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO admin;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: sentry_installation id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sentry_installation ALTER COLUMN id SET DEFAULT nextval('public.sentry_installation_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: github_repo id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.github_repo ALTER COLUMN id SET DEFAULT nextval('public.github_repo_seq'::regclass);

--
-- Name: deployment_protection_rule_request id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.deployment_protection_rule_request ALTER COLUMN id SET DEFAULT nextval('public.deployment_protection_rule_request_seq'::regclass);


--
-- Data for Name: sentry_installation; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sentry_installation (id, uuid, org_slug, token, refresh_token, expires_at, organization_id) FROM stdin;
\.


--
-- Name: sentry_installation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.sentry_installation_id_seq', 1, false);


--
-- Name: github_repo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.github_repo_id_seq', 1, false);

--
-- Name: deployment_protection_rule_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.deployment_protection_rule_request_id_seq', 1, false);

--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.user_id_seq', 4, true);


--
-- Name: github_repo github_repo_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.github_repo
    ADD CONSTRAINT github_repo_pkey PRIMARY KEY (id);

--
-- Name: deployment_protection_rule_request deployment_protection_rule_request_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.deployment_protection_rule_request
    ADD CONSTRAINT deployment_protection_rule_request_pkey PRIMARY KEY (id);    


--
-- Name: sentry_installation sentry_installation_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sentry_installation
    ADD CONSTRAINT sentry_installation_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: deployment_protection_rule_request deployment_protection_rule_request_github_repo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.deployment_protection_rule_request
    ADD CONSTRAINT deployment_protection_rule_request_github_repo_id_fkey FOREIGN KEY (github_repo_id) REFERENCES public.github_repo(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: github_repo github_repo_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.github_repo
    ADD CONSTRAINT github_repo_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: github_repo github_repo_sentry_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.github_repo
    ADD CONSTRAINT github_repo_sentry_installation_id_fkey FOREIGN KEY (sentry_installation_id) REFERENCES public.sentry_installation(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: github_repo github_repo_sentry_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_sentry_installation_id_fkey FOREIGN KEY (sentry_installation_id) REFERENCES public.sentry_installation(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
