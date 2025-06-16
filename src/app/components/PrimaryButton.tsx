"use client";
import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
    handleClick: () => void;
    text: string;
};

const PrimaryButton = ({ handleClick, text }: Props) => {
    return <Button className="" onClick={() => handleClick()}>{text}</Button>;
};

export default PrimaryButton;
