using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace ChromebeastLauncher;

class Program
{
    static void Main(string[] args)
    {
        Console.Title = "CHROMEBEAST | BAT ENTERPRISE";
        Console.ForegroundColor = ConsoleColor.Magenta;

        string currentPath = AppDomain.CurrentDomain.BaseDirectory;
        string? rootPath = FindProjectRoot(currentPath);

        Console.WriteLine("==================================================");
        Console.WriteLine("          CHROMEBEAST - BOOT SEQUENCE");
        Console.WriteLine("          DEVELOPED BY BAT ENTERPRISE");
        Console.WriteLine("==================================================");

        if (rootPath == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO FATAL] DIRETORIO DO SISTEMA NAO ENCONTRADO.");
            Console.WriteLine("NAO FOI POSSIVEL LOCALIZAR 'src\\backend' E 'src\\frontend'.");
            Console.WriteLine("LOCAL ATUAL: " + currentPath);
            Console.WriteLine("\nCERTIFIQUE-SE DE QUE O LANCADOR ESTA DENTRO DA PASTA DO PROJETO.");
            Console.ReadKey();
            return;
        }

        string backendPath = Path.Combine(rootPath, "src", "backend");

        if (!IsCommandAvailable("node"))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO] NODE.JS NAO ENCONTRADO NO SISTEMA.");
            Console.WriteLine("POR FAVOR, INSTALE O NODE.JS PARA CONTINUAR.");
            Console.ReadKey();
            return;
        }

        if (!IsCommandAvailable("npm"))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO] NPM NAO ENCONTRADO NO SISTEMA.");
            Console.WriteLine("POR FAVOR, INSTALE O NODE.JS COMPLETO PARA CONTINUAR.");
            Console.ReadKey();
            return;
        }

        if (!Directory.Exists(Path.Combine(backendPath, "node_modules")))
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("\n[!] INSTALANDO DEPENDENCIAS DO NUCLEO...");
            RunCommand("npm install", backendPath);
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("\n[>] ATIVANDO BACKEND (SQLITE + SMTP)...");
        StartBackend(backendPath);

        Console.WriteLine("[>] SINCRONIZANDO INTERFACE...");
        Thread.Sleep(3000);
        OpenUrl("http://localhost:3000");

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("\n[OK] SISTEMA OPERACIONAL ATIVO.");
        Console.WriteLine("==================================================");
        Console.ForegroundColor = ConsoleColor.Gray;
        Console.WriteLine("Mantenha esta janela aberta para o backend continuar rodando.");

        while (true)
        {
            Thread.Sleep(1000);
        }
    }

    static string? FindProjectRoot(string startPath)
    {
        string? current = startPath;

        while (current != null)
        {
            if (Directory.Exists(Path.Combine(current, "src", "backend")) &&
                Directory.Exists(Path.Combine(current, "src", "frontend")))
            {
                return current;
            }

            current = Directory.GetParent(current)?.FullName;
        }

        return null;
    }

    static bool IsCommandAvailable(string cmd)
    {
        try
        {
            var psi = new ProcessStartInfo("where", cmd)
            {
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true
            };

            var process = Process.Start(psi);
            process?.WaitForExit();
            return process?.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    static void RunCommand(string command, string workingDir)
    {
        var psi = new ProcessStartInfo("cmd.exe", "/c " + command)
        {
            WorkingDirectory = workingDir,
            UseShellExecute = false,
            CreateNoWindow = false
        };

        Process.Start(psi)?.WaitForExit();
    }

    static void StartBackend(string workingDir)
    {
        var psi = new ProcessStartInfo("cmd.exe", "/c node server.js")
        {
            WorkingDirectory = workingDir,
            UseShellExecute = true,
            WindowStyle = ProcessWindowStyle.Normal
        };

        Process.Start(psi);
    }

    static void OpenUrl(string path)
    {
        var psi = new ProcessStartInfo
        {
            FileName = path,
            UseShellExecute = true
        };

        Process.Start(psi);
    }
}
