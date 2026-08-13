-- Profesores (1 fila por cuenta de profesor; hoy solo habrá una)
create table teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique not null,
  name text not null,
  created_at timestamptz default now()
);

-- Alumnos, vinculados a un profesor
create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique, -- null hasta que el alumno acepta la invitación
  teacher_id uuid references teachers not null,
  name text not null,
  created_at timestamptz default now()
);

-- Códigos de invitación de un solo uso (o multiuso, a decidir) por profesor
create table invites (
  code text primary key,
  teacher_id uuid references teachers not null,
  created_at timestamptz default now(),
  used_at timestamptz
);

-- Una fila por audio grabado = una sesión de feedback
create table sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students not null,
  training_type text not null, -- Volea | Saque | Recepción | Ataque | Defensa
  audio_path text not null,    -- ruta en Storage (bucket session-audio)
  transcript text,
  template jsonb,              -- campos ya estructurados: fallos, ejercicios, puntos a mejorar...
  score numeric(3,1),          -- nota propuesta por la IA, ajustable por el profesor
  score_confirmed boolean default false,
  pdf_url text,
  status text default 'processing', -- processing | ready | error
  read boolean default false, -- false hasta que el alumno abre esta ficha
  created_at timestamptz default now()
);

alter table teachers enable row level security;
alter table students enable row level security;
alter table invites enable row level security;
alter table sessions enable row level security;

-- El profesor solo ve y gestiona su propio equipo
create policy "teacher manages own students" on students
  for all using (teacher_id in (select id from teachers where user_id = auth.uid()));

-- El alumno solo ve sus propias sesiones; el profesor ve las de su equipo
create policy "student reads own sessions" on sessions
  for select using (
    student_id in (select id from students where user_id = auth.uid())
    or student_id in (
      select id from students where teacher_id in (
        select id from teachers where user_id = auth.uid()
      )
    )
  );
