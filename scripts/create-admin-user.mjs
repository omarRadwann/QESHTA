import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SUPABASE_ADMIN_EMAIL ?? "admin@qeshta.local";
const password = process.env.SUPABASE_ADMIN_PASSWORD;
const fullName = process.env.SUPABASE_ADMIN_NAME ?? "QESHTA Admin";

if (!supabaseUrl || !serviceRoleKey || !password) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ADMIN_PASSWORD before creating an admin user.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(userEmail) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === userEmail.toLowerCase(),
    );

    if (user || data.users.length < 1000) return user ?? null;
    page += 1;
  }
}

const existingUser = await findUserByEmail(email);
let userId;

if (existingUser) {
  const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    email_confirm: true,
    password,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) throw error;
  userId = data.user.id;
  process.stdout.write(`Updated admin user: ${data.user.email}\n`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) throw error;
  userId = data.user.id;
  process.stdout.write(`Created admin user: ${data.user.email}\n`);
}

const { error: profileError } = await supabase.from("profiles").upsert({
  email,
  full_name: fullName,
  id: userId,
  role: "admin",
  updated_at: new Date().toISOString(),
});

if (profileError) throw profileError;
process.stdout.write(`Granted admin role: ${email}\n`);
