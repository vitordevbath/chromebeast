using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;

namespace StarcoreLauncher;

internal sealed class AppLayout
{
    public required string RootPath { get; init; }
    public required string BackendPath { get; init; }
    public required string FrontendPath { get; init; }
    public required bool IsPackagedLayout { get; init; }
    public string? BundledNodePath { get; init; }
}

class Program
{
    private const string PayloadPrefix = "StarcorePayload/";

    static void Main(string[] args)
    {
        Console.Title = "STARCORE SENTINEL | BAT ENTERPRISE";
        Console.ForegroundColor = ConsoleColor.Magenta;

        string basePath = AppDomain.CurrentDomain.BaseDirectory;
        AppLayout? layout = FindDevelopmentLayout(basePath) ?? ExtractEmbeddedLayout();

        Console.WriteLine("==================================================");
        Console.WriteLine("        STARCORE SENTINEL - BOOT SEQUENCE");
        Console.WriteLine("          DEVELOPED BY BAT ENTERPRISE");
        Console.WriteLine("==================================================");

        if (layout == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO FATAL] ESTRUTURA DO SISTEMA NAO ENCONTRADA.");
            Console.WriteLine("Nao foi possivel localizar nem extrair o pacote do app.");
            Console.ReadKey();
            return;
        }

        string? nodeCommand = ResolveNodeCommand(layout);
        string? npmCommand = ResolveNpmCommand();

        if (nodeCommand == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n[ERRO] NODE.JS NAO ENCONTRADO.");
            Console.WriteLine("O executavel nao encontrou nem o runtime embutido nem uma instalacao local.");
            Console.ReadKey();
            return;
        }

        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine($"\n[LAYOUT] {(layout.IsPackagedLayout ? "EMBUTIDO" : "DESENVOLVIMENTO")}");
        Console.WriteLine($"[ROOT] {layout.RootPath}");
        Console.WriteLine($"[BACKEND] {layout.BackendPath}");

        bool hasNodeModules = Directory.Exists(Path.Combine(layout.BackendPath, "node_modules"));
        if (!hasNodeModules)
        {
            if (npmCommand == null)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n[ERRO] DEPENDENCIAS DO BACKEND AUSENTES E NPM INDISPONIVEL.");
                Console.WriteLine("Instale o Node.js ou publique novamente o launcher com os modulos embutidos.");
                Console.ReadKey();
                return;
            }

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

    static AppLayout? FindDevelopmentLayout(string startPath)
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
                    IsPackagedLayout = false,
                    BundledNodePath = null
                };
            }

            current = Directory.GetParent(current)?.FullName;
        }

        return null;
    }

    static AppLayout? ExtractEmbeddedLayout()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceNames = assembly.GetManifestResourceNames()
            .Where((name) => name.StartsWith(PayloadPrefix, StringComparison.Ordinal))
            .ToArray();

        if (resourceNames.Length == 0)
        {
            return null;
        }

        string extractionRoot = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "StarcoreSentinel",
            "runtime");

        Directory.CreateDirectory(extractionRoot);

        foreach (string resourceName in resourceNames)
        {
            string relativePath = resourceName.Substring(PayloadPrefix.Length)
                .Replace('/', Path.DirectorySeparatorChar);

            string outputPath = Path.Combine(extractionRoot, relativePath);
            string? outputDir = Path.GetDirectoryName(outputPath);

            if (!string.IsNullOrEmpty(outputDir))
            {
                Directory.CreateDirectory(outputDir);
            }

            using Stream? input = assembly.GetManifestResourceStream(resourceName);
            if (input == null)
            {
                continue;
            }

            using FileStream output = new FileStream(outputPath, FileMode.Create, FileAccess.Write, FileShare.Read);
            input.CopyTo(output);
        }

        return new AppLayout
        {
            RootPath = extractionRoot,
            BackendPath = Path.Combine(extractionRoot, "backend"),
            FrontendPath = Path.Combine(extractionRoot, "frontend"),
            IsPackagedLayout = true,
            BundledNodePath = Path.Combine(extractionRoot, "runtime", "node.exe")
        };
    }

    static string? ResolveNodeCommand(AppLayout layout)
    {
        if (!string.IsNullOrWhiteSpace(layout.BundledNodePath) && File.Exists(layout.BundledNodePath))
        {
            return layout.BundledNodePath;
        }

        return IsCommandAvailable("node") ? "node" : null;
    }

    static string? ResolveNpmCommand()
    {
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
