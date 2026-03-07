<?php

namespace App\Enums;

enum DocTypeEnum: string
{
    case ID_CARD = 'ID_CARD';
    case PASSPORT = 'PASSPORT';
    case DRIVERS_LICENSE = 'DRIVERS_LICENSE';
    case RESIDENCE_CARD = 'RESIDENCE_CARD';
}
