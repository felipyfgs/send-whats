"use client";

import React from "react";
import { User, Briefcase, Users, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryIcons, ContatoCategoriaPt } from "../utils/contato-helpers";

interface ContatoCategoriaIconProps {
  categoria: ContatoCategoriaPt;
  className?: string;
}

export function ContatoCategoriaIcon({ 
  categoria, 
  className 
}: ContatoCategoriaIconProps) {
  switch (categoria) {
    case "pessoal":
      return <User className={cn(className)} />;
    case "trabalho":
      return <Briefcase className={cn(className)} />;
    case "familia":
      return <Users className={cn(className)} />;
    case "outro":
      return <HeartHandshake className={cn(className)} />;
    default:
      return <User className={cn(className)} />;
  }
} 