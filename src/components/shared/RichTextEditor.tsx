import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react';


interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: string;
    className?: string;
    actions?: React.ReactNode;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    disabled = false,
    className = '',
    actions
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync external value changes to editor content only when not focused (to avoid cursor jumping)
    useEffect(() => {
        if (editorRef.current && !isFocused && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value, isFocused]);

    // Active Formats Tracking
    const [activeFormats, setActiveFormats] = useState<string[]>([]);

    const checkFormats = () => {
        const formats = ['bold', 'italic', 'insertUnorderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
        const active = formats.filter(cmd => document.queryCommandState(cmd));
        setActiveFormats(active);
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        checkFormats();
    };

    const handleKeyUpAndClick = () => {
        checkFormats();
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleInput(); // Trigger change after command
        editorRef.current?.focus();
        checkFormats();
    };

    const ToolbarButton = ({ icon: Icon, cmd, arg, active = false }: any) => {
        const isActive = active || activeFormats.includes(cmd);
        return (
            <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); execCmd(cmd, arg); }}
                className={`p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-slate-200 text-slate-900 shadow-inner' : ''}`}
                disabled={disabled}
            >
                <Icon className="w-4 h-4" />
            </button>
        );
    };

    return (
        <div className={`relative flex flex-col h-full border rounded-xl overflow-hidden bg-white transition-all ${isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-border'} ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-slate-100 bg-slate-50 min-h-[44px]">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <ToolbarButton icon={Bold} cmd="bold" />
                    <ToolbarButton icon={Italic} cmd="italic" />
                    <div className="w-px h-4 bg-slate-300 mx-1 shrink-0" />
                    <ToolbarButton icon={List} cmd="insertUnorderedList" />
                    <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" />
                    <div className="w-px h-4 bg-slate-300 mx-1 shrink-0" />
                    <ToolbarButton icon={AlignLeft} cmd="justifyLeft" />
                    <ToolbarButton icon={AlignCenter} cmd="justifyCenter" />
                    <ToolbarButton icon={AlignRight} cmd="justifyRight" />
                    <div className="w-px h-4 bg-slate-300 mx-1 shrink-0" />
                    <ToolbarButton icon={Undo} cmd="undo" />
                    <ToolbarButton icon={Redo} cmd="redo" />
                </div>

                {/* Right Side Actions */}
                {actions && (
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-2">
                        {actions}
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-white flex flex-col relative custom-scrollbar">
                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onKeyUp={handleKeyUpAndClick}
                    onMouseUp={handleKeyUpAndClick}
                    onClick={handleKeyUpAndClick}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 p-5 outline-none text-sm font-medium text-slate-700 leading-relaxed min-h-full [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    data-placeholder={placeholder}
                />

                {!value && !isFocused && (
                    <div className="absolute top-4 left-4 text-slate-200 font-light text-sm pointer-events-none">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
}
