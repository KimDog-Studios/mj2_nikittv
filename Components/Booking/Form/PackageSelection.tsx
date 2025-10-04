"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import { Package } from './types';
import { packages } from './utils';

interface PackageSelectionProps {
  selectedPackage: string;
  onPackageChange: (packageId: string) => void;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({
  selectedPackage,
  onPackageChange
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
        Select Your MJ Tribute Package
      </Typography>
      <RadioGroup
        value={selectedPackage}
        onChange={(e) => onPackageChange(e.target.value)}
        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}
      >
        {packages.map((pkg: Package) => (
          <Card
            key={pkg.id}
            sx={{
              flex: 1,
              cursor: 'pointer',
              border: selectedPackage === pkg.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
              bgcolor: selectedPackage === pkg.id ? 'rgba(25, 118, 210, 0.1)' : theme.palette.background.paper,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${theme.palette.primary.main}30`
              }
            }}
            onClick={() => onPackageChange(pkg.id)}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  value={pkg.id}
                  control={<Radio />}
                  label=""
                  sx={{ mr: 1 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                    {pkg.name}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                    {pkg.duration} • £{pkg.price}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                {pkg.description}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {pkg.features.map((feature, index) => (
                  <Typography key={index} component="li" variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    {feature}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
      <Typography variant="body2" sx={{ textAlign: 'center', color: theme.palette.text.secondary, mt: 2, fontStyle: 'italic' }}>
        * This is just the starting price. Final pricing may vary based on specific requirements and customizations.
      </Typography>
      {selectedPackage && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.success.main, textAlign: 'center' }}>
            Selected: <strong>{packages.find(p => p.id === selectedPackage)?.name}</strong> - £{packages.find(p => p.id === selectedPackage)?.price}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PackageSelection;