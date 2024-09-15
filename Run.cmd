
@echo off

cd server
start cmd.exe /k npm start

cd ../client
start cmd.exe /k npm start

