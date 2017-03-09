CREATE TABLE "Roles" (
  id integer NOT NULL,
  title character varying(255),
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE "Users" (
  id integer NOT NULL,
  username character varying(255),
  firstname character varying(255),
  lastname character varying(255),
  email character varying(255),
  password character varying(255),
  "roleId" integer,
  active boolean NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE "Documents" (
  id integer NOT NULL,
  "ownerId" integer,
  "ownerRoleId" integer,
  access character varying(255) DEFAULT 'public'::character varying NOT NULL,
  title character varying(255) NOT NULL,
  content text NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);
