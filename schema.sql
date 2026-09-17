create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  content text not null,
  reply_to_id uuid references messages(id) on delete set null,
  created_at timestamptz default now()
);

alter table users enable row level security;
alter table messages enable row level security;

create policy "users_select_all" on users for select using (true);
create policy "users_insert_all" on users for insert with check (true);
create policy "messages_select_all" on messages for select using (true);
create policy "messages_insert_all" on messages for insert with check (true);

alter publication supabase_realtime add table messages;
