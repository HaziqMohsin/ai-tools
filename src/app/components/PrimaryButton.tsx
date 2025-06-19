"use client";
import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
    handleClick: () => void;
    text: string;
    disabled: boolean;
};

const PrimaryButton = ({ handleClick, text, disabled }: Props) => {
    return (
        <Button className="" onClick={() => handleClick()} disabled={disabled}>
            {text}
        </Button>
    );
};

export default PrimaryButton;
