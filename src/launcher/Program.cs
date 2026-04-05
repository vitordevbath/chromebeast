using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace ChromebeastLauncher;

internal sealed class AppLayout
{
    public required string RootPath { get; init; }
    public required string BackendPath { get; init; }
    public required string FrontendPath { get; init; }
    public required bool IsPackagedLayout { get; init; }
}

class Program
{
    static void Main(string[] args)
    {
        Console.Title = "CHROMEBEAST | BAT ENTERPRISE";
        Console.ForegroundColor = ConsoleColor.Magenta;

        string basePath = AppDomain.CurrentDomain.BaseDirectory;
        AppLayout? layout = FindAppLayout(basePath);

        Console.WriteLine("==================================================");
        Console.WriteLine("          CHROMEBEAST - BOOT SEQUENCE");
        Console.WriteLine("          DEVELOPED BY BAT ENTERPRISE");
        Console.WriteLine("==================================================");

        if (layout == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO FATAL] DIRETORIO DO SISTEMA NAO ENCONTRADO.");
            Console.WriteLine("NAO FOI POSSIVEL LOCALIZAR A ESTRUTURA DO APP.");
            Console.WriteLine("LOCAL ATUAL: " + basePath);
            Console.WriteLine("\nO LANCADOR ESPERA UMA DESTAS ESTRUTURAS:");
            Console.WriteLine("- desenvolvimento: src\\backend e src\\frontend");
            Console.WriteLine("- pacote: backend e frontend ao lado do .exe");
            Console.ReadKey();
            return;
        }

        string? nodeCommand = ResolveNodeCommand(layout.RootPath);
        string? npmCommand = ResolveNpmCommand(layout.RootPath);

        if (nodeCommand == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO] NODE.JS NAO ENCONTRADO.");
            Console.WriteLine("Instale Node.js ou coloque um runtime local em runtime\\node\\node.exe.");
            Console.ReadKey();
            return;
        }

        if (npmCommand == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO] NPM NAO ENCONTRADO.");
            Console.WriteLine("Instale Node.js completo ou forneca runtime\\node\\npm.cmd.");
            Console.ReadKey();
            return;
        }

        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine($"\n[LAYOUT] {(layout.IsPackagedLayout ? "PACOTE" : "DESENVOLVIMENTO")}");
        Console.WriteLine($"[ROOT] {layout.RootPath}");
        Console.WriteLine($"[BACKEND] {layout.BackendPath}");

        if (!Directory.Exists(Path.Combine(layout.BackendPath, "node_modules")))
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("\n[!] INSTALANDO DEPENDENCIAS DO NUCLEO...");
            RunCommand(npmCommand, "install", layout.BackendPath);
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("\n[>] ATIVANDO BACKEND (SQLITE + SMTP)...");
        StartBackend(nodeCommand, layout.BackendPath);

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

    static AppLayout? FindAppLayout(string startPath)
    {
        string? current = startPath;

        while (current != null)
        {
            string srcBackend = Path.Combine(current, "src", "backend");
            string srcFrontend = Path.Combine(current, "src", "frontend");

            if (Directory.Exists(srcBackend) && Directory.Exists(srcFrontend))
            {
                return new AppLayout
                {
                    RootPath = current,
                    BackendPath = srcBackend,
                    FrontendPath = srcFrontend,
                    IsPackagedLayout = false
                };
            }

            string packagedBackend = Path.Combine(current, "backend");
            string packagedFrontend = Path.Combine(current, "frontend");

            if (Directory.Exists(packagedBackend) && Directory.Exists(packagedFrontend))
            {
                return new AppLayout
                {
                    RootPath = current,
                    BackendPath = packagedBackend,
                    FrontendPath = packagedFrontend,
                    IsPackagedLayout = true
                };
            }

            current = Directory.GetParent(current)?.FullName;
        }

        return null;
    }

    static string? ResolveNodeCommand(string rootPath)
    {
        string localNode = Path.Combine(rootPath, "runtime", "node", "node.exe");
        if (File.Exists(localNode))
        {
            return localNode;
        }

        return IsCommandAvailable("node") ? "node" : null;
    }

    static string? ResolveNpmCommand(string rootPath)
    {
        string localNpmCmd = Path.Combine(rootPath, "runtime", "node", "npm.cmd");
        if (File.Exists(localNpmCmd))
        {
            return localNpmCmd;
        }

        return IsCommandAvailable("npm") ? "npm" : null;
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

    static void RunCommand(string executable, string arguments, string workingDir)
    {
        var psi = new ProcessStartInfo(executable, arguments)
        {
            WorkingDirectory = workingDir,
            UseShellExecute = false,
            CreateNoWindow = false
        };

        Process.Start(psi)?.WaitForExit();
    }

    static void StartBackend(string nodeCommand, string workingDir)
    {
        var psi = new ProcessStartInfo(nodeCommand, "server.js")
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
