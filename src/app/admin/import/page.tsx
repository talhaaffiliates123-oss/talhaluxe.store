
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DeprecatedImportPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">AI Product Importer</h1>
            <p className="text-muted-foreground">This feature has been replaced with manual image uploads.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive"/>
                    Feature Removed
                </CardTitle>
                <CardDescription>
                    The AI-based product importer has been disabled. You can now upload images directly when creating or editing a product.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Please use the image upload functionality within the <Link href="/admin/products/new" className="text-primary underline">product form</Link>.</p>
            </CardContent>
        </Card>
    </div>
  );
}
