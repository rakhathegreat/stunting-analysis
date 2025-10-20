import { createClient } from '@supabase/supabase-js'


const supabase = createClient('https://kgswlhiolxopunygghrs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnc3dsaGlvbHhvcHVueWdnaHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTQwOTksImV4cCI6MjA3NjMzMDA5OX0.YbcHV5Skq1ZkgUJLgzYhOSI8_kk7dUKypHZooc2tsY0')

export default supabase;