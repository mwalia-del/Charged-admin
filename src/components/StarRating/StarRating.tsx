import React from 'react';
import { Box, Typography } from '@mui/material';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  showValue = true,
  color = 'primary'
}) => {
  // Ensure rating is a valid number
  const numericRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
  
  const sizeMap = {
    small: 'body2',
    medium: 'body1',
    large: 'h6'
  };

  const typographyVariant = sizeMap[size];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        variant={typographyVariant as any}
        sx={{
          color: color,
          fontWeight: 'bold',
          minWidth: 'fit-content'
        }}
      >
        {numericRating.toFixed(1)}
      </Typography>
    </Box>
  );
};

export default StarRating;
