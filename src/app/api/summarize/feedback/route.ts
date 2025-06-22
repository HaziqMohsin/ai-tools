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

    const { data: dataVote, error: fetchError } = await supabase
        .from("summaries")
        .select("upvotes, downvotes")
        .eq("id", id)
        .single();

    if (fetchError || !dataVote)
        return NextResponse.json(
            { error: fetchError?.message },
            { status: 500 }
        );

    const updateField = {
        upvotes: feedback === "up" ? dataVote.upvotes + 1 : dataVote.upvotes,
        downvotes:
            feedback === "down" ? dataVote.downvotes + 1 : dataVote.downvotes,
    };

    const { error } = await supabase
        .from("summaries")
        .update(updateField)
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Feedback saved" });
}
