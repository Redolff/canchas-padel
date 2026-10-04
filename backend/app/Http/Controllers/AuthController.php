<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->load('businessAccount');
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('businessAccount');
        return response()->json($this->userPayload($user));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    private function userPayload(User $user): array
    {
        return [
            'name'              => $user->name,
            'email'             => $user->email,
            'role'              => $user->role ?? 'owner',
            'businessAccountId' => $user->business_account_id,
            'businessName'      => $user->businessAccount?->name,
            'defaultSlotPrice'  => $user->businessAccount?->default_slot_price,
        ];
    }
}
