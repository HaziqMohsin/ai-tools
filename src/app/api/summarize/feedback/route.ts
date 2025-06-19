import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import { z } from "zod";

const FeedbackSchema = z.object({
    id: z.string(),
    feedback: z.enum(["up", "down"]),
});

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const body = await req.json();

    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { id, feedback } = parsed.data;

    const { error } = await supabase
        .from("summaries")
        .update({ feedback })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Feedback saved" });
}
