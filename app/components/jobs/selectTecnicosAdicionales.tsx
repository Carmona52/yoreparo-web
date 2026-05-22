'use client';

import {User} from '@/lib/types/user';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

type Props = {
    tecnicos: User[];
    seleccionados: string[];
    onChange: (ids: string[]) => void;
    liderID?: string;
    disabled?: boolean;
};

export default function SelectorTecnicosAdicionales({
                                                        tecnicos, seleccionados, onChange, liderID, disabled,
                                                    }: Props) {
    const opciones = tecnicos.filter((t) => t.id !== liderID);
    const seleccionadosObj = opciones.filter((t) => seleccionados.includes(t.id));

    return (
        <Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.5}}>
                <GroupAddIcon sx={{fontSize: 17, color: '#5A5A72'}}/>
                <Typography variant="body2" fontWeight={700}>
                    Técnicos adicionales
                </Typography>
                {seleccionados.length > 0 && (
                    <Chip
                        label={seleccionados.length}
                        size="small"
                        sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: 'rgba(21,101,192,0.1)',
                            color: '#1565C0'
                        }}
                    />
                )}
            </Box>

            <Autocomplete
                multiple
                options={opciones}
                getOptionLabel={(o) => o.name ?? ''}
                value={seleccionadosObj}
                disabled={disabled}
                onChange={(_, newVal) => onChange(newVal.map((t) => t.id))}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                        const tagProps = getTagProps({index});
                        return (
                            <Chip
                                {...tagProps}
                                key={option.id}
                                avatar={
                                    <Avatar sx={{bgcolor: '#1565C0', color: '#fff', fontSize: 10, fontWeight: 800}}>
                                        {option.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                }
                                label={option.name}
                                size="small"
                                sx={{fontWeight: 600, fontSize: 11}}
                            />
                        );
                    })
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        label="Buscar técnicos adicionales"
                        placeholder={seleccionados.length === 0 ? 'Opcional — puedes agregar más tarde' : ''}
                    />
                )}
                renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}
                         sx={{display: 'flex', alignItems: 'center', gap: 1.5, p: 1}}>
                        <Avatar key={option.id} sx={{
                            width: 28,
                            height: 28,
                            fontSize: 11,
                            bgcolor: '#FFD600',
                            color: '#1A1A2E',
                            fontWeight: 800
                        }}>
                            {option.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                        </Box>
                        <Chip label={option.role} size="small"
                              sx={{
                                  ml: 'auto',
                                  height: 18,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  bgcolor: 'rgba(255,214,0,0.15)',
                                  color: '#B8860B'
                              }}/>
                    </Box>
                )}
                noOptionsText="No hay más técnicos disponibles"
            />

            {seleccionadosObj.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block'}}>
                    {seleccionadosObj.length} técnico{seleccionadosObj.length > 1 ? 's' : ''} adicional{seleccionadosObj.length > 1 ? 'es' : ''} ·
                    recibirán notificaciones del trabajo
                </Typography>
            )}
        </Box>
    );
}