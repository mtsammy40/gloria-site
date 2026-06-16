-- Runs once on first container start; creates the test database alongside dev.
SELECT 'CREATE DATABASE gloria_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gloria_test')\gexec
