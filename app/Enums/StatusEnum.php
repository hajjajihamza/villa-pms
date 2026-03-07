<?php

namespace App\Enums;

enum StatusEnum: string
{
    case PENDING = 'PENDING';
    case CONFIRMED = 'CONFIRMED';
    case CANCELLED = 'CANCELLED';
    case CHECKED_OUT = 'CHECKED_OUT';
}
