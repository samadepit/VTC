import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const CodeGenerator = () => {
    const [code, setCode] = useState<string | null>(null);
    const generateCode = async (e) => {
        e.preventDefault();
        const reponse = await fetch("http://127.0.0.1:8000/generer-code/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

        });
        const data = await reponse.json();
        if (reponse.ok) {
            setCode(data.code);
            toast.success("Code generé avec success");
        } else {
            toast.error(data.message || "Impossible de generer le code");
        }
    };
    return (
        <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Générateur de Code</h2>
            <div className="flex flex-col items-center gap-4">
                <Button onClick={generateCode} size="lg">
                    Générer un nouveau code
                </Button>
                {code && (
                    <div className="animate-fadeIn p-4 bg-green-300 rounded-lg">
                        <p className="text-lg font-mono">{code}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};