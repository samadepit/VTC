import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const CodeGenerator = () => {
    const [code, setCode] = useState<string | null>(null);
    const [isButtonloading, setIsButtonloading] = useState(false)
    const generateCode = async (e) => {
        setIsButtonloading(true)
        e.preventDefault();
        const reponse = await fetch("https://vtc-bjny.onrender.com/generer-code/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

        });
        const data = await reponse.json();
        if (reponse.ok) {
            setIsButtonloading(false)
            setCode(data.code);
            toast.success("Code generé avec success");
        } else {
            toast.error(data.message || "Impossible de generer le code");
            setIsButtonloading(false)
        }
    };
    return (
        <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-center">Générateur de Code</h2>
            <div className="flex flex-col items-center gap-4">
                {!isButtonloading ? (
                    <Button onClick={generateCode} size="lg">
                        Générer un nouveau code
                    </Button>
                ) : (
                    <div className="flex justify-center p-1 rounded-lg btn-primary">
                        <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                    </div>
                )}
                {code && (
                    <div className="animate-fadeIn p-4 bg-green-300 rounded-lg">
                        <p className="text-lg font-mono">{code}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};