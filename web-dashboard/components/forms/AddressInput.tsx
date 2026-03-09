'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export default function AddressInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}: AddressInputProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter complete address'}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Include street, city, state, and postal code for accurate delivery
      </p>
    </div>
  );
}
